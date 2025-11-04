import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Eye, BarChart, LogOut, ExternalLink, Upload } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaLinkedin, FaReddit, FaGithub, FaDiscord, FaTwitch, FaSpotify, FaLink } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: 'link' });
  const [showAddLink, setShowAddLink] = useState(false);

  const iconOptions = [
    { name: 'link', icon: FaLink, label: 'Default Link' },
    { name: 'facebook', icon: FaFacebook, label: 'Facebook' },
    { name: 'twitter', icon: FaTwitter, label: 'X (Twitter)' },
    { name: 'instagram', icon: FaInstagram, label: 'Instagram' },
    { name: 'youtube', icon: FaYoutube, label: 'YouTube' },
    { name: 'tiktok', icon: FaTiktok, label: 'TikTok' },
    { name: 'linkedin', icon: FaLinkedin, label: 'LinkedIn' },
    { name: 'reddit', icon: FaReddit, label: 'Reddit' },
    { name: 'github', icon: FaGithub, label: 'GitHub' },
    { name: 'discord', icon: FaDiscord, label: 'Discord' },
    { name: 'twitch', icon: FaTwitch, label: 'Twitch' },
    { name: 'spotify', icon: FaSpotify, label: 'Spotify' }
  ];

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await handleUpdatePage({ avatar: reader.result });
        toast.success('Profile picture updated!');
      } catch (error) {
        toast.error('Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
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
                <label>Profile Picture</label>
                <div className="avatar-upload">
                  {page?.avatar ? (
                    <img src={page.avatar} alt="Profile" className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">No Image</div>
                  )}
                  <label htmlFor="avatar-input" className="upload-btn">
                    <Upload size={18} />
                    Upload Image
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

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
                  
                  <div className="icon-picker">
                    <label>Choose Icon:</label>
                    <div className="icon-grid">
                      {iconOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.name}
                            type="button"
                            className={`icon-option ${newLink.icon === option.name ? 'selected' : ''}`}
                            onClick={() => setNewLink({ ...newLink, icon: option.name })}
                            title={option.label}
                          >
                            <IconComponent size={24} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

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
