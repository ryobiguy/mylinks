const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// Stripe webhook handler
module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body is raw buffer from express.raw() middleware
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    console.error('Webhook secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await handleSubscriptionChange(subscription);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper function to handle checkout completion
async function handleCheckoutComplete(session) {
  const userId = session.metadata.userId;
  const user = await User.findById(userId);
  
  if (user) {
    user.plan = 'pro';
    user.subscriptionId = session.subscription;
    user.subscriptionStatus = 'active';
    await user.save();
    console.log(`✅ User ${user.email} upgraded to Pro`);
  }
}

// Helper function to handle subscription changes
async function handleSubscriptionChange(subscription) {
  const user = await User.findOne({ subscriptionId: subscription.id });
  
  if (user) {
    const status = subscription.status;
    user.subscriptionStatus = status;
    
    if (status === 'canceled' || status === 'unpaid') {
      user.plan = 'free';
    } else if (status === 'active') {
      user.plan = 'pro';
    }
    
    await user.save();
    console.log(`✅ Subscription updated for ${user.email}: ${status}`);
  }
};
