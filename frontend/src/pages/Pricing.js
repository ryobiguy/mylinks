import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Crown, Zap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Pricing.css';

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in first');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${API_URL}/payments/create-checkout-session`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>Choose Your Plan</h1>
        <p>Start free, upgrade when you're ready</p>
      </div>

      <div className="pricing-cards">
        {/* Free Plan */}
        <div className="pricing-card">
          <div className="plan-header">
            <h2>Free</h2>
            <div className="price">
              <span className="amount">$0</span>
              <span className="period">/month</span>
            </div>
          </div>

          <ul className="features-list">
            <li><Check size={20} /> Unlimited links</li>
            <li><Check size={20} /> Link scheduling</li>
            <li><Check size={20} /> QR code generator</li>
            <li><Check size={20} /> Basic analytics</li>
            <li><Check size={20} /> 5 themes</li>
            <li><Check size={20} /> Custom colors</li>
            <li><Check size={20} /> Profile picture</li>
            <li><Check size={20} /> Social links</li>
          </ul>

          <Link to="/register" className="plan-button secondary">
            Get Started Free
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="pricing-card featured">
          <div className="popular-badge">
            <Crown size={16} /> Most Popular
          </div>
          
          <div className="plan-header">
            <h2>Pro</h2>
            <div className="price">
              <span className="amount">$9</span>
              <span className="period">/month</span>
            </div>
          </div>

          <ul className="features-list">
            <li><Check size={20} /> <strong>Everything in Free</strong></li>
            <li><Zap size={20} className="highlight" /> 4 Premium themes</li>
            <li><Zap size={20} className="highlight" /> Remove branding</li>
            <li><Zap size={20} className="highlight" /> Advanced analytics</li>
            <li><Zap size={20} className="highlight" /> Device breakdown</li>
            <li><Zap size={20} className="highlight" /> Time series data</li>
            <li><Zap size={20} className="highlight" /> Link heatmap</li>
            <li><Zap size={20} className="highlight" /> Top referrers</li>
            <li><Zap size={20} className="highlight" /> Priority support</li>
          </ul>

          <button 
            onClick={handleUpgrade} 
            className="plan-button primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        
        <div className="faq-item">
          <h3>Can I cancel anytime?</h3>
          <p>Yes! You can cancel your subscription at any time. You'll keep Pro features until the end of your billing period.</p>
        </div>

        <div className="faq-item">
          <h3>What payment methods do you accept?</h3>
          <p>We accept all major credit cards through Stripe, our secure payment processor.</p>
        </div>

        <div className="faq-item">
          <h3>Can I upgrade or downgrade my plan?</h3>
          <p>Yes! You can upgrade to Pro anytime. If you downgrade, you'll keep Pro features until the end of your billing period.</p>
        </div>

        <div className="faq-item">
          <h3>Do you offer refunds?</h3>
          <p>We offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
