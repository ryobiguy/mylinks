const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const Analytics = require('../models/Analytics');
const { auth } = require('../middleware/auth');

// Get analytics for user's page
router.get('/my-page', auth, async (req, res) => {
  try {
    const page = await Page.findOne({ user: req.userId });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Calculate total clicks
    const totalClicks = page.links.reduce((sum, link) => sum + link.clicks, 0);

    // Get top links
    const topLinks = page.links
      .filter(link => link.isActive)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map(link => ({
        id: link._id,
        title: link.title,
        url: link.url,
        clicks: link.clicks
      }));

    const analytics = {
      totalViews: page.views,
      totalClicks: totalClicks,
      totalLinks: page.links.length,
      activeLinks: page.links.filter(link => link.isActive).length,
      topLinks: topLinks,
      clickThroughRate: page.views > 0 ? ((totalClicks / page.views) * 100).toFixed(2) : 0
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get detailed analytics with device breakdown, time series, etc.
router.get('/detailed', auth, async (req, res) => {
  try {
    const page = await Page.findOne({ user: req.userId });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get all analytics data for the time period
    const analyticsData = await Analytics.find({
      page: page._id,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Device breakdown
    const deviceBreakdown = {
      mobile: analyticsData.filter(a => a.device === 'mobile').length,
      desktop: analyticsData.filter(a => a.device === 'desktop').length,
      tablet: analyticsData.filter(a => a.device === 'tablet').length,
      unknown: analyticsData.filter(a => a.device === 'unknown').length
    };

    // Top referrers
    const referrerCounts = {};
    analyticsData.forEach(a => {
      if (a.referrer && a.referrer !== 'direct') {
        referrerCounts[a.referrer] = (referrerCounts[a.referrer] || 0) + 1;
      }
    });
    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([referrer, count]) => ({ referrer, count }));

    // Time series data (daily)
    const timeSeriesData = {};
    analyticsData.forEach(a => {
      const date = a.timestamp.toISOString().split('T')[0];
      if (!timeSeriesData[date]) {
        timeSeriesData[date] = { views: 0, clicks: 0 };
      }
      if (a.type === 'view') {
        timeSeriesData[date].views++;
      } else if (a.type === 'click') {
        timeSeriesData[date].clicks++;
      }
    });

    const timeSeries = Object.entries(timeSeriesData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Link click heatmap
    const linkClicks = {};
    analyticsData.filter(a => a.type === 'click' && a.linkId).forEach(a => {
      const linkKey = a.linkId.toString();
      if (!linkClicks[linkKey]) {
        linkClicks[linkKey] = {
          linkId: a.linkId,
          title: a.linkTitle,
          clicks: 0
        };
      }
      linkClicks[linkKey].clicks++;
    });

    const linkHeatmap = Object.values(linkClicks)
      .sort((a, b) => b.clicks - a.clicks);

    res.json({
      deviceBreakdown,
      topReferrers,
      timeSeries,
      linkHeatmap,
      totalEvents: analyticsData.length,
      totalViews: analyticsData.filter(a => a.type === 'view').length,
      totalClicks: analyticsData.filter(a => a.type === 'click').length
    });
  } catch (error) {
    console.error('Get detailed analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Track analytics event (called from public page)
router.post('/track', async (req, res) => {
  try {
    const { username, type, linkId, linkTitle, userAgent, referrer } = req.body;

    const page = await Page.findOne({ username });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Parse user agent for device info
    const ua = userAgent || '';
    let device = 'unknown';
    if (/mobile/i.test(ua)) device = 'mobile';
    else if (/tablet|ipad/i.test(ua)) device = 'tablet';
    else if (/mozilla/i.test(ua)) device = 'desktop';

    // Create analytics entry
    await Analytics.create({
      page: page._id,
      type,
      linkId: linkId || null,
      linkTitle: linkTitle || null,
      device,
      referrer: referrer || 'direct',
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
