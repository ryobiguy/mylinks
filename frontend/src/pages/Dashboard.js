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
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: 'link', iconOnly: false, position: 'main' });
  const [showAddLink, setShowAddLink] = useState(false);

  const iconOptions = [
    { name: 'link', icon: FaLink, label: 'Default Link', type: 'react' },
    { name: 'facebook', icon: FaFacebook, label: 'Facebook', type: 'react' },
    { name: 'fb', icon: '/icons/fb.png', label: 'Facebook (Custom)', type: 'image' },
    { name: 'twitter', icon: FaTwitter, label: 'X (Twitter)', type: 'react' },
    { name: 'x', icon: '/icons/x.png', label: 'X (Custom)', type: 'image' },
    { name: 'instagram', icon: FaInstagram, label: 'Instagram', type: 'react' },
    { name: 'insta', icon: '/icons/insta.png', label: 'Instagram (Custom)', type: 'image' },
    { name: 'youtube', icon: FaYoutube, label: 'YouTube', type: 'react' },
    { name: 'yt', icon: '/icons/yt.png', label: 'YouTube (Custom)', type: 'image' },
    { name: 'tiktok', icon: FaTiktok, label: 'TikTok', type: 'react' },
    { name: 'tiktok-custom', icon: '/icons/tiktok.png', label: 'TikTok (Custom)', type: 'image' },
    { name: 'linkedin', icon: FaLinkedin, label: 'LinkedIn', type: 'react' },
    { name: 'reddit', icon: FaReddit, label: 'Reddit', type: 'react' },
    { name: 'github', icon: FaGithub, label: 'GitHub', type: 'react' },
    { name: 'discord', icon: FaDiscord, label: 'Discord', type: 'react' },
    { name: 'discord-custom', icon: '/icons/discord.png', label: 'Discord (Custom)', type: 'image' },
    { name: 'twitch', icon: FaTwitch, label: 'Twitch', type: 'react' },
    { name: 'twitch-custom', icon: '/icons/twitch.png', label: 'Twitch (Custom)', type: 'image' },
    { name: 'spotify', icon: FaSpotify, label: 'Spotify', type: 'react' },
    { name: 'snapchat', icon: '/icons/snapchat.png', label: 'Snapchat', type: 'image' },
    { name: 'telegram', icon: '/icons/telegram.png', label: 'Telegram', type: 'image' },
    { name: 'pinterest', icon: '/icons/pinterest.png', label: 'Pinterest', type: 'image' },
    { name: 'onlyfans', icon: '/icons/of.png', label: 'OnlyFans', type: 'image' }
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
    if (!newLink.url) return;

    // If icon-only and no title, use the icon name as title
    const linkToAdd = {
      ...newLink,
      title: newLink.title || (newLink.iconOnly ? iconOptions.find(opt => opt.name === newLink.icon)?.label || 'Link' : '')
    };

    if (!linkToAdd.title) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/pages/my-page/links`, linkToAdd, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPage(response.data.page);
      setNewLink({ title: '', url: '', icon: 'link', iconOnly: false, position: 'main' });
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
              <h3>Appearance</h3>
              
              <div className="form-group">
                <label>Theme</label>
                <div className="theme-grid">
                  <button
                    type="button"
                    className={`theme-option ${!page?.theme || page?.theme === 'default' ? 'selected' : ''}`}
                    onClick={() => handleUpdatePage({ theme: 'default' })}
                  >
                    <div className="theme-preview default-theme">
                      <div className="theme-bg"></div>
                      <div className="theme-button"></div>
                    </div>
                    <span>Default</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`theme-option ${page?.theme === 'dark' ? 'selected' : ''}`}
                    onClick={() => handleUpdatePage({ theme: 'dark' })}
                  >
                    <div className="theme-preview dark-theme">
                      <div className="theme-bg"></div>
                      <div className="theme-button"></div>
                    </div>
                    <span>Dark</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`theme-option ${page?.theme === 'gradient' ? 'selected' : ''}`}
                    onClick={() => handleUpdatePage({ theme: 'gradient' })}
                  >
                    <div className="theme-preview gradient-theme">
                      <div className="theme-bg"></div>
                      <div className="theme-button"></div>
                    </div>
                    <span>Gradient</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`theme-option ${page?.theme === 'minimal' ? 'selected' : ''}`}
                    onClick={() => handleUpdatePage({ theme: 'minimal' })}
                  >
                    <div className="theme-preview minimal-theme">
                      <div className="theme-bg"></div>
                      <div className="theme-button"></div>
                    </div>
                    <span>Minimal</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Button Style</label>
                <select
                  value={page?.buttonStyle || 'rounded'}
                  onChange={(e) => handleUpdatePage({ buttonStyle: e.target.value })}
                  className="select-input"
                >
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                  <option value="pill">Pill</option>
                  <option value="outlined">Outlined</option>
                </select>
              </div>

              <div className="form-group">
                <label>Font</label>
                <select
                  value={page?.font || 'system'}
                  onChange={(e) => handleUpdatePage({ font: e.target.value })}
                  className="select-input"
                >
                  <option value="system">System Default</option>
                  <option value="inter">Inter</option>
                  <option value="poppins">Poppins</option>
                  <option value="roboto">Roboto</option>
                  <option value="montserrat">Montserrat</option>
                  <option value="playfair">Playfair Display</option>
                </select>
              </div>

              <div className="form-group">
                <label>Background Color</label>
                <input
                  type="color"
                  value={page?.customColors?.background || '#ffffff'}
                  onChange={(e) => handleUpdatePage({ 
                    customColors: { ...page?.customColors, background: e.target.value }
                  })}
                  className="color-input"
                />
              </div>

              <div className="form-group">
                <label>Text Color</label>
                <input
                  type="color"
                  value={page?.customColors?.text || '#000000'}
                  onChange={(e) => handleUpdatePage({ 
                    customColors: { ...page?.customColors, text: e.target.value }
                  })}
                  className="color-input"
                />
              </div>

              <div className="form-group">
                <label>Button Color</label>
                <input
                  type="color"
                  value={page?.customColors?.button || '#000000'}
                  onChange={(e) => handleUpdatePage({ 
                    customColors: { ...page?.customColors, button: e.target.value }
                  })}
                  className="color-input"
                />
              </div>

              <div className="form-group">
                <label>Button Text Color</label>
                <input
                  type="color"
                  value={page?.customColors?.buttonText || '#ffffff'}
                  onChange={(e) => handleUpdatePage({ 
                    customColors: { ...page?.customColors, buttonText: e.target.value }
                  })}
                  className="color-input"
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
                    placeholder={newLink.iconOnly ? "Link title (for tooltip)" : "Link title"}
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    required={!newLink.iconOnly}
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
                        return (
                          <button
                            key={option.name}
                            type="button"
                            className={`icon-option ${newLink.icon === option.name ? 'selected' : ''}`}
                            onClick={() => setNewLink({ ...newLink, icon: option.name })}
                            title={option.label}
                          >
                            {option.type === 'image' ? (
                              <img src={option.icon} alt={option.label} style={{ width: 24, height: 24 }} />
                            ) : (
                              <option.icon size={24} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newLink.iconOnly}
                        onChange={(e) => setNewLink({ ...newLink, iconOnly: e.target.checked })}
                      />
                      <span>Icon Only (no text)</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Position</label>
                    <select
                      value={newLink.position}
                      onChange={(e) => setNewLink({ ...newLink, position: e.target.value })}
                      className="select-input"
                    >
                      <option value="top">Top (Social Icons)</option>
                      <option value="main">Main (Regular Links)</option>
                      <option value="bottom">Bottom (Footer Icons)</option>
                    </select>
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
              <div 
                className="preview-content"
                style={{
                  background: page?.customColors?.background || '#ffffff',
                  color: page?.customColors?.text || '#000000'
                }}
              >
                {page?.avatar ? (
                  <img src={page.avatar} alt="Profile" className="preview-avatar-img" />
                ) : (
                  <div className="preview-avatar"></div>
                )}
                <h2 style={{ color: page?.customColors?.text || '#000000' }}>
                  {page?.title || 'Your Title'}
                </h2>
                <p style={{ color: page?.customColors?.text || '#666666' }}>
                  {page?.bio || 'Your bio'}
                </p>
                <div className="preview-links">
                  {page?.links?.map((link) => {
                    const IconComponent = iconOptions.find(opt => opt.name === link.icon)?.icon || FaLink;
                    return (
                      <div 
                        key={link._id} 
                        className={`preview-link preview-button-${page?.buttonStyle || 'rounded'}`}
                        style={{
                          background: page?.customColors?.button || '#000000',
                          color: page?.customColors?.buttonText || '#ffffff'
                        }}
                      >
                        <IconComponent size={16} />
                        <span>{link.title}</span>
                      </div>
                    );
                  })}
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
