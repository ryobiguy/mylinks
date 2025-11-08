import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Eye, MousePointer, Link as LinkIcon, TrendingUp, Smartphone, Monitor, Tablet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const [basicRes, detailedRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/my-page`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/analytics/detailed?days=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setAnalytics(basicRes.data.analytics);
      setDetailedAnalytics(detailedRes.data);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Prepare device data for pie chart
  const deviceData = detailedAnalytics ? [
    { name: 'Mobile', value: detailedAnalytics.deviceBreakdown.mobile, icon: <Smartphone size={16} /> },
    { name: 'Desktop', value: detailedAnalytics.deviceBreakdown.desktop, icon: <Monitor size={16} /> },
    { name: 'Tablet', value: detailedAnalytics.deviceBreakdown.tablet, icon: <Tablet size={16} /> },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <div>
          <h1>Analytics</h1>
          <div className="time-range-selector">
            <button className={timeRange === 7 ? 'active' : ''} onClick={() => setTimeRange(7)}>7 Days</button>
            <button className={timeRange === 30 ? 'active' : ''} onClick={() => setTimeRange(30)}>30 Days</button>
            <button className={timeRange === 90 ? 'active' : ''} onClick={() => setTimeRange(90)}>90 Days</button>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Eye size={32} /></div>
            <div className="stat-info">
              <div className="stat-value">{detailedAnalytics?.totalViews || 0}</div>
              <div className="stat-label">Total Views</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><MousePointer size={32} /></div>
            <div className="stat-info">
              <div className="stat-value">{detailedAnalytics?.totalClicks || 0}</div>
              <div className="stat-label">Total Clicks</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><LinkIcon size={32} /></div>
            <div className="stat-info">
              <div className="stat-value">{analytics.activeLinks}</div>
              <div className="stat-label">Active Links</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><TrendingUp size={32} /></div>
            <div className="stat-info">
              <div className="stat-value">{analytics.clickThroughRate}%</div>
              <div className="stat-label">Click Rate</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {detailedAnalytics && (
          <>
            {/* Time Series Chart */}
            <div className="chart-section">
              <h2>Views & Clicks Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={detailedAnalytics.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#4F46E5" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicks" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Device Breakdown & Link Heatmap */}
            <div className="analytics-grid">
              {/* Device Breakdown */}
              <div className="chart-section">
                <h2>Device Breakdown</h2>
                {deviceData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="device-legend">
                      {deviceData.map((device, index) => (
                        <div key={device.name} className="legend-item">
                          <div className="legend-color" style={{ background: COLORS[index % COLORS.length] }}></div>
                          <span>{device.name}: {device.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="empty-state">No device data yet</p>
                )}
              </div>

              {/* Link Click Heatmap */}
              <div className="chart-section">
                <h2>Link Click Heatmap</h2>
                {detailedAnalytics.linkHeatmap.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={detailedAnalytics.linkHeatmap.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="empty-state">No click data yet</p>
                )}
              </div>
            </div>

            {/* Top Referrers */}
            {detailedAnalytics.topReferrers.length > 0 && (
              <div className="chart-section">
                <h2>Top Referrers</h2>
                <div className="referrers-list">
                  {detailedAnalytics.topReferrers.map((ref, index) => (
                    <div key={index} className="referrer-item">
                      <span className="referrer-name">{ref.referrer}</span>
                      <span className="referrer-count">{ref.count} visits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
