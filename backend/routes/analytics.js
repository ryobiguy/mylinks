const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
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

module.exports = router;
