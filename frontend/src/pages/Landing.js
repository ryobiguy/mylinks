import React from 'react';
import { Link } from 'react-router-dom';
import { Link as LinkIcon, BarChart, Palette, Zap } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <img src="/logo.png" alt="MyLinks" style={{ height: '120px' }} />
            </div>
            <div className="nav-links">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Get Started Free</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <h1>One Link For Everything</h1>
          <p className="hero-subtitle">
            Share all your links in one place. Perfect for Instagram, TikTok, Twitter, and more.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn-primary btn-large">
              Create Your Free Page
            </Link>
            <p className="cta-note">No credit card required</p>
          </div>
          <div className="hero-demo">
            <div className="demo-phone">
              <div className="demo-content">
                <div className="demo-avatar"></div>
                <h3>@yourname</h3>
                <p>Welcome to my page!</p>
                <div className="demo-links">
                  <div className="demo-link">My Website</div>
                  <div className="demo-link">YouTube Channel</div>
                  <div className="demo-link">Instagram</div>
                  <div className="demo-link">Shop My Products</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Everything You Need</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <LinkIcon size={32} />
              </div>
              <h3>Unlimited Links</h3>
              <p>Add as many links as you want. No limits on the free plan.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart size={32} />
              </div>
              <h3>Analytics</h3>
              <p>Track views and clicks to see what's working best.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Palette size={32} />
              </div>
              <h3>Custom Themes</h3>
              <p>Make it yours with custom colors and themes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>Lightning Fast</h3>
              <p>Your page loads instantly. No slow loading times.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing">
        <div className="container">
          <h2>Simple Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">
                <span className="amount">£0</span>
                <span className="period">/month</span>
              </div>
              <ul className="features-list">
                <li>✓ Unlimited links</li>
                <li>✓ Basic analytics</li>
                <li>✓ 3 themes</li>
                <li>✓ MyLinks branding</li>
              </ul>
              <Link to="/register" className="btn-secondary btn-block">Get Started</Link>
            </div>
            <div className="pricing-card featured">
              <div className="popular-badge">Most Popular</div>
              <h3>Pro</h3>
              <div className="price">
                <span className="amount">£4.99</span>
                <span className="period">/month</span>
              </div>
              <ul className="features-list">
                <li>✓ Everything in Free</li>
                <li>✓ Remove branding</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Custom themes</li>
                <li>✓ Custom domain</li>
                <li>✓ QR code</li>
                <li>✓ Priority support</li>
              </ul>
              <Link to="/register" className="btn-primary btn-block">Start Pro Trial</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to get started?</h2>
          <p>Join thousands of creators using MyLinks</p>
          <Link to="/register" className="btn-primary btn-large">
            Create Your Free Page
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2025 MyLinks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
