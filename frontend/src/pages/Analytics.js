import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Eye, MousePointer, Link as LinkIcon, TrendingUp, Calendar, Clock } from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/analytics/my-page`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <h1>Analytics</h1>
      </div>

      <div className="analytics-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Eye size={32} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{analytics.totalViews}</div>
              <div className="stat-label">Total Views</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MousePointer size={32} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{analytics.totalClicks}</div>
              <div className="stat-label">Total Clicks</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <LinkIcon size={32} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{analytics.activeLinks}</div>
              <div className="stat-label">Active Links</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={32} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{analytics.clickThroughRate}%</div>
              <div className="stat-label">Click Rate</div>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="top-links-section">
            <h2>Top Performing Links</h2>
            {analytics.topLinks.length === 0 ? (
              <p className="empty-state">No link data yet</p>
            ) : (
              <div className="top-links-list">
                {analytics.topLinks.map((link, index) => (
                  <div key={link.id} className="top-link-item">
                    <div className="link-rank">#{index + 1}</div>
                    <div className="link-details">
                      <h3>{link.title}</h3>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-url">
                        {link.url}
                      </a>
                    </div>
                    <div className="link-stats">
                      <span className="click-count">{link.clicks} clicks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="insights-section">
            <h2>Quick Insights</h2>
            <div className="insights-list">
              <div className="insight-item">
                <div className="insight-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="insight-text">
                  <strong>Average CTR:</strong> {analytics.clickThroughRate}%
                  <p>Click-through rate from page views</p>
                </div>
              </div>
              
              <div className="insight-item">
                <div className="insight-icon">
                  <LinkIcon size={20} />
                </div>
                <div className="insight-text">
                  <strong>Links:</strong> {analytics.activeLinks} active / {analytics.totalLinks} total
                  <p>Currently visible links on your page</p>
                </div>
              </div>

              <div className="insight-item">
                <div className="insight-icon">
                  <MousePointer size={20} />
                </div>
                <div className="insight-text">
                  <strong>Avg. Clicks per Link:</strong> {analytics.totalLinks > 0 ? (analytics.totalClicks / analytics.totalLinks).toFixed(1) : 0}
                  <p>Average engagement per link</p>
                </div>
              </div>

              {analytics.topLinks.length > 0 && (
                <div className="insight-item">
                  <div className="insight-icon">
                    <TrendingUp size={20} />
                  </div>
                  <div className="insight-text">
                    <strong>Top Performer:</strong> {analytics.topLinks[0].title}
                    <p>{analytics.topLinks[0].clicks} clicks ({((analytics.topLinks[0].clicks / analytics.totalClicks) * 100).toFixed(1)}% of total)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
