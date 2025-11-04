import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Eye, BarChart, LogOut, ExternalLink } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [showAddLink, setShowAddLink] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/pages/my-page`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPage(response.data.page);
    } catch (error) {
      console.error('Fetch page error:', error);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePage = async (updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/pages/my-page`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPage(response.data.page);
      toast.success('Page updated!');
    } catch (error) {
      console.error('Update page error:', error);
      toast.error('Failed to update page');
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/pages/my-page/links`, newLink, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPage(response.data.page);
      setNewLink({ title: '', url: '' });
      setShowAddLink(false);
      toast.success('Link added!');
    } catch (error) {
      console.error('Add link error:', error);
      toast.error('Failed to add link');
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!window.confirm('Delete this link?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/pages/my-page/links/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPage(response.data.page);
      toast.success('Link deleted!');
    } catch (error) {
      console.error('Delete link error:', error);
      toast.error('Failed to delete link');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <img src="/logo.png" alt="MyLinks" style={{ height: '80px' }} />
          <div className="nav-actions">
            <Link to={`/${user?.username}`} className="btn-secondary">
              <Eye size={18} />
              View Page
            </Link>
            <Link to="/analytics" className="btn-secondary">
              <BarChart size={18} />
              Analytics
            </Link>
            <button onClick={handleLogout} className="btn-secondary">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Edit Your Page</h1>
          <p>mylinks.com/{user?.username}</p>
        </div>

        <div className="dashboard-grid">
          <div className="editor-section">
            <div className="section-card">
              <h3>Page Info</h3>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={page?.title || ''}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  onBlur={() => handleUpdatePage({ title: page.title })}
                  placeholder="My Links"
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={page?.bio || ''}
                  onChange={(e) => setPage({ ...page, bio: e.target.value })}
                  onBlur={() => handleUpdatePage({ bio: page.bio })}
                  placeholder="Welcome to my page!"
                  rows={3}
                />
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <h3>Links</h3>
                <button 
                  onClick={() => setShowAddLink(!showAddLink)} 
                  className="btn-primary btn-small"
                >
                  <Plus size={18} />
                  Add Link
                </button>
              </div>

              {showAddLink && (
                <form onSubmit={handleAddLink} className="add-link-form">
                  <input
                    type="text"
                    placeholder="Link title"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    required
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    required
                  />
                  <div className="form-actions">
                    <button type="submit" className="btn-primary btn-small">Add</button>
                    <button 
                      type="button" 
                      onClick={() => setShowAddLink(false)} 
                      className="btn-secondary btn-small"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="links-list">
                {page?.links?.length === 0 ? (
                  <p className="empty-state">No links yet. Add your first link!</p>
                ) : (
                  page?.links?.map((link) => (
                    <div key={link._id} className="link-item">
                      <div className="link-info">
                        <h4>{link.title}</h4>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-url">
                          {link.url}
                          <ExternalLink size={14} />
                        </a>
                        <span className="link-clicks">{link.clicks} clicks</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteLink(link._id)} 
                        className="btn-icon"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="preview-section">
            <div className="preview-header">
              <h3>Preview</h3>
            </div>
            <div className="phone-preview">
              <div className="preview-content">
                <div className="preview-avatar"></div>
                <h2>{page?.title}</h2>
                <p>{page?.bio}</p>
                <div className="preview-links">
                  {page?.links?.map((link) => (
                    <div key={link._id} className="preview-link">
                      {link.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
