const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const { auth } = require('../middleware/auth');

// Get user's page
router.get('/my-page', auth, async (req, res) => {
  try {
    const page = await Page.findOne({ user: req.userId });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json({ page });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get public page by username
router.get('/:username', async (req, res) => {
  try {
    const page = await Page.findOne({ 
      username: req.params.username.toLowerCase(),
      isPublished: true
    });
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Increment views
    page.views += 1;
    await page.save();

    res.json({ page });
  } catch (error) {
    console.error('Get public page error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update page
router.put('/my-page', auth, async (req, res) => {
  try {
    const { title, bio, avatar, theme, customColors, socialLinks } = req.body;

    const page = await Page.findOne({ user: req.userId });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Update fields
    if (title !== undefined) page.title = title;
    if (bio !== undefined) page.bio = bio;
    if (avatar !== undefined) page.avatar = avatar;
    if (theme !== undefined) page.theme = theme;
    if (customColors) page.customColors = { ...page.customColors, ...customColors };
    if (socialLinks) page.socialLinks = { ...page.socialLinks, ...socialLinks };

    await page.save();
    res.json({ page });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add link
router.post('/my-page/links', auth, async (req, res) => {
  try {
    const { title, url, icon, iconOnly, iconSize, position } = req.body;

    const page = await Page.findOne({ user: req.userId });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    page.links.push({
      title,
      url,
      icon: icon || 'link',
      iconOnly: iconOnly || false,
      iconSize: iconSize || 50,
      position: position || 'main',
      order: page.links.length
    });

    await page.save();
    res.json({ page });
  } catch (error) {
    console.error('Add link error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update link
router.put('/my-page/links/:linkId', auth, async (req, res) => {
  try {
    const { title, url, icon, isActive } = req.body;

    const page = await Page.findOne({ user: req.userId });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const link = page.links.id(req.params.linkId);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (title !== undefined) link.title = title;
    if (url !== undefined) link.url = url;
    if (icon !== undefined) link.icon = icon;
    if (isActive !== undefined) link.isActive = isActive;

    await page.save();
    res.json({ page });
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete link
router.delete('/my-page/links/:linkId', auth, async (req, res) => {
  try {
    const page = await Page.findOne({ user: req.userId });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    page.links.pull(req.params.linkId);
    await page.save();
    res.json({ page });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder links
router.put('/my-page/links/reorder', auth, async (req, res) => {
  try {
    const { linkIds } = req.body; // Array of link IDs in new order

    const page = await Page.findOne({ user: req.userId });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Update order for each link
    linkIds.forEach((linkId, index) => {
      const link = page.links.id(linkId);
      if (link) {
        link.order = index;
      }
    });

    // Sort links by order
    page.links.sort((a, b) => a.order - b.order);

    await page.save();
    res.json({ page });
  } catch (error) {
    console.error('Reorder links error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Track link click
router.post('/:username/links/:linkId/click', async (req, res) => {
  try {
    const page = await Page.findOne({ username: req.params.username.toLowerCase() });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const link = page.links.id(req.params.linkId);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    link.clicks += 1;
    await page.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
