const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Create checkout session for Pro plan
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    console.log('Creating checkout session for user:', req.userId);
    console.log('Stripe Price ID:', process.env.STRIPE_PRICE_ID);
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      console.error('User not found:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Check if launch promo is still active (expires Dec 1, 2025)
    const promoEndDate = new Date('2025-12-01T00:00:00Z');
    const isPromoActive = new Date() < promoEndDate;

    // Create checkout session
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // You'll create this in Stripe dashboard
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?upgrade=cancelled`,
      metadata: {
        userId: user._id.toString()
      }
    };

    // Add trial only if promo is active
    if (isPromoActive) {
      sessionConfig.subscription_data = {
        trial_period_days: 90, // 3 months free trial
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create portal session for managing subscription
router.post('/create-portal-session', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    console.log('Portal session - User ID:', req.userId);
    console.log('Portal session - User email:', user?.email);
    console.log('Portal session - Stripe Customer ID:', user?.stripeCustomerId);
    
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

module.exports = router;
