import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Eye, BarChart, LogOut, ExternalLink, Upload, GripVertical, QrCode, Download, Calendar, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaLinkedin, FaReddit, FaGithub, FaDiscord, FaTwitch, FaSpotify, FaLink } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { HexColorPicker } from 'react-colorful';
import ImageCropModal from '../components/ImageCropModal';
import ScheduleModal from '../components/ScheduleModal';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: 'link', iconOnly: false, iconSize: 50, position: 'main' });
  const [showAddLink, setShowAddLink] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [openColorPicker, setOpenColorPicker] = useState(null); // 'background', 'text', 'button', 'buttonText'
  const [tempColor, setTempColor] = useState(null);
  const [tempGradientStart, setTempGradientStart] = useState(null);
  const [tempGradientEnd, setTempGradientEnd] = useState(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const savingGradient = React.useRef(false);
  const gradientSaveTimeout = React.useRef(null);
  const isPickingGradient = React.useRef(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [newBlock, setNewBlock] = useState({ 
    type: 'image', 
    title: '', 
    description: '', 
    imageUrl: '', 
    linkUrl: '', 
    backgroundColor: '#ffffff',
    textColor: '#000000',
    layout: 'full'
  });
  const [editingLink, setEditingLink] = useState(null);
  const [openSections, setOpenSections] = useState({
    pageInfo: true,
    appearance: false,
    seo: false,
    links: true,
    contentBlocks: false
  });
  
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openColorPicker && !event.target.closest('.color-picker-wrapper')) {
        setOpenColorPicker(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openColorPicker]);

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

  // Clear gradient save timeout on unmount
  useEffect(() => {
    return () => {
      if (gradientSaveTimeout.current) {
        clearTimeout(gradientSaveTimeout.current);
      }
    };
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
      console.log('Updating page with:', Object.keys(updates));
      console.log('Gradient being saved:', updates.customColors?.background);
      const response = await axios.put(`${API_URL}/pages/my-page`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Server returned gradient:', response.data.page.customColors?.background);
      setPage(response.data.page);
      toast.success('Page updated!');
    } catch (error) {
      console.error('Update page error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to update page');
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB for cover)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Cover photo must be less than 2MB');
      return;
    }

    // Load image for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImage) => {
    setShowCropModal(false);
    setImageToCrop(null);
    
    try {
      await handleUpdatePage({ coverPhoto: croppedImage });
      toast.success('Cover photo updated!');
    } catch (error) {
      toast.error('Failed to upload cover photo');
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

    // Compress and convert to base64
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Resize if too large (max 400px)
      const maxSize = 400;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      
      try {
        await handleUpdatePage({ avatar: compressedBase64 });
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

    // Check link limit for free users
    const currentLinks = page?.links?.length || 0;
    if (user?.plan === 'free' && currentLinks >= 4) {
      toast.error('Free plan limited to 4 links. Upgrade to Pro for unlimited links!');
      return;
    }

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
      setNewLink({ title: '', url: '', icon: 'link', iconOnly: false, iconSize: 50, position: 'main' });
      setShowAddLink(false);
      toast.success('Link added!');
    } catch (error) {
      console.error('Add link error:', error);
      toast.error('Failed to add link');
    }
  };

  const [draggedLink, setDraggedLink] = useState(null);

  const handleDragStart = (e, link) => {
    setDraggedLink(link);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetLink) => {
    e.preventDefault();
    
    if (!draggedLink || draggedLink._id === targetLink._id) {
      setDraggedLink(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const draggedIndex = page.links.findIndex(l => l._id === draggedLink._id);
      const targetIndex = page.links.findIndex(l => l._id === targetLink._id);
      
      const newLinks = [...page.links];
      newLinks.splice(draggedIndex, 1);
      newLinks.splice(targetIndex, 0, draggedLink);
      
      // Update order values
      newLinks.forEach((link, index) => {
        link.order = index;
      });
      
      const response = await axios.put(`${API_URL}/pages/my-page/links/reorder`, 
        { links: newLinks.map(l => ({ id: l._id, order: l.order })) },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setPage(response.data.page);
      setDraggedLink(null);
      toast.success('Link order updated!');
    } catch (error) {
      console.error('Reorder error:', error);
      toast.error('Failed to reorder link');
      setDraggedLink(null);
    }
  };

  const handleEditLink = (link) => {
    setEditingLink(link);
    setNewLink({
      title: link.title,
      url: link.url,
      icon: link.icon,
      iconOnly: link.iconOnly || false,
      iconSize: link.iconSize || 50,
      position: link.position || 'main'
    });
    setShowAddLink(true);
  };

  const handleUpdateLink = async (e) => {
    e.preventDefault();
    if (!newLink.url) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/pages/my-page/links/${editingLink._id}`, newLink, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPage(response.data.page);
      setNewLink({ title: '', url: '', icon: 'link', iconOnly: false, iconSize: 50, position: 'main' });
      setShowAddLink(false);
      setEditingLink(null);
      toast.success('Link updated!');
    } catch (error) {
      console.error('Update link error:', error);
      toast.error('Failed to update link');
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

  // Content Block Handlers
  const handleAddBlock = async (e) => {
    e.preventDefault();
    
    if (user?.plan === 'free') {
      toast.error('Content Blocks are a Pro feature! Upgrade to unlock.');
      return;
    }

    if (!newBlock.title || !newBlock.imageUrl) {
      toast.error('Please fill in title and image URL');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/pages/my-page/content-blocks`, newBlock, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPage(response.data.page);
      setNewBlock({ 
        type: 'image', 
        title: '', 
        description: '', 
        imageUrl: '', 
        linkUrl: '', 
        backgroundColor: '#ffffff',
        textColor: '#000000',
        layout: 'full'
      });
      setShowAddBlock(false);
      toast.success('Content block added!');
    } catch (error) {
      console.error('Add block error:', error);
      toast.error('Failed to add content block');
    }
  };

  const handleEditBlock = (block) => {
    setEditingBlock(block);
    setNewBlock({
      type: block.type,
      title: block.title,
      description: block.description,
      imageUrl: block.imageUrl,
      linkUrl: block.linkUrl,
      backgroundColor: block.backgroundColor,
      layout: block.layout
    });
    setShowAddBlock(true);
  };

  const handleUpdateBlock = async (e) => {
    e.preventDefault();

    if (!newBlock.title || !newBlock.imageUrl) {
      toast.error('Please fill in title and image');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/pages/my-page/content-blocks/${editingBlock._id}`, newBlock, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPage(response.data.page);
      setNewBlock({ 
        type: 'image', 
        title: '', 
        description: '', 
        imageUrl: '', 
        linkUrl: '', 
        backgroundColor: '#ffffff',
        textColor: '#000000',
        layout: 'full'
      });
      setShowAddBlock(false);
      setEditingBlock(null);
      toast.success('Content block updated!');
    } catch (error) {
      console.error('Update block error:', error);
      toast.error('Failed to update content block');
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!window.confirm('Delete this content block?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/pages/my-page/content-blocks/${blockId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPage(response.data.page);
      toast.success('Content block deleted!');
    } catch (error) {
      console.error('Delete block error:', error);
      toast.error('Failed to delete content block');
    }
  };

  const handleBlockImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize to max 800x600 for content blocks
        let width = img.width;
        let height = img.height;
        const maxWidth = 800;
        const maxHeight = 600;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setNewBlock({ ...newBlock, imageUrl: compressedBase64 });
        toast.success('Image uploaded!');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `${user.username}-qrcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleScheduleLink = (link) => {
    setSelectedLink(link);
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async (schedule) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/pages/my-page/links/${selectedLink._id}`,
        { schedule },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setPage({
        ...page,
        links: page.links.map(l => 
          l._id === selectedLink._id ? { ...l, schedule } : l
        )
      });
      
      toast.success('Schedule updated!');
      setShowScheduleModal(false);
      setSelectedLink(null);
    } catch (error) {
      console.error('Update schedule error:', error);
      toast.error('Failed to update schedule');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <img src="/logo.png" alt="MyLinks" style={{ height: '180px' }} />
          <div className="nav-actions">
            <Link to={`/${user?.username}`} className="btn-secondary">
              <Eye size={18} />
              View Page
            </Link>
            <button 
              onClick={() => {
                if (user?.plan === 'free') {
                  toast.error('QR Code is a Pro feature. Upgrade to access!');
                } else {
                  setShowQRCode(true);
                }
              }} 
              className="btn-secondary"
              style={user?.plan === 'free' ? { opacity: 0.6 } : {}}
            >
              <QrCode size={18} />
              QR Code {user?.plan === 'free' && '👑'}
            </button>
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
          <div>
            <h1>Edit Your Page</h1>
            <p>mylinks.com/{user?.username}</p>
          </div>
          {user?.plan === 'free' ? (
            <Link to="/pricing" className="upgrade-btn">
              👑 Upgrade to Pro
            </Link>
          ) : (
            <button 
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const response = await axios.post(`${API_URL}/payments/create-portal-session`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  window.open(response.data.url, '_blank');
                } catch (error) {
                  console.error('Portal error:', error);
                  toast.error('Failed to open billing portal');
                }
              }}
              className="btn-secondary"
            >
              Manage Subscription
            </button>
          )}
        </div>

        <div className="dashboard-grid">
          <div className="editor-section">
            <div className="section-card">
              <div 
                onClick={() => toggleSection('pageInfo')}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}
              >
                <h3 style={{ margin: 0 }}>Page Info</h3>
                {openSections.pageInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {openSections.pageInfo && (
              <>
              <div className="form-group">
                <label>Cover Photo</label>
                <p className="helper-text" style={{ marginBottom: '8px' }}>
                  📐 Recommended: 1500x500px • Max 2MB • JPG, PNG, or WebP
                </p>
                <div className="cover-upload">
                  {page?.coverPhoto ? (
                    <img src={page.coverPhoto} alt="Cover" className="cover-preview" />
                  ) : (
                    <div className="cover-placeholder">No cover photo</div>
                  )}
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('cover-upload').click()}
                    className="upload-btn"
                  >
                    <Upload size={20} />
                    Upload Cover
                  </button>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Profile Picture</label>
                <p className="helper-text" style={{ marginBottom: '8px' }}>
                  📐 Recommended: 400x400px (square) • Max 2MB • JPG, PNG, or WebP
                </p>
                <div className="avatar-upload">
                  {page?.avatar ? (
                    <img src={page.avatar} alt="Avatar" className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">No image</div>
                  )}
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('avatar-upload').click()}
                    className="upload-btn"
                  >
                    <Upload size={20} />
                    Upload Image
                  </button>
                  <input
                    id="avatar-upload"
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
              </>
              )}
            </div>

            <div className="section-card">
              <div 
                onClick={() => toggleSection('appearance')}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}
              >
                <h3 style={{ margin: 0 }}>Appearance</h3>
                {openSections.appearance ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {openSections.appearance && (
              <>
              <div className="form-group">
                <label>Page Background</label>
                <p className="helper-text" style={{ marginBottom: '8px' }}>
                  {user?.plan === 'pro' ? '💎 Pro: Create gradients with two colors' : '🎨 Free: Solid color only'}
                </p>
                
                {user?.plan === 'pro' ? (
                  <div>
                    <label style={{ fontSize: '0.875rem', marginBottom: '8px', display: 'block' }}>Gradient Colors 👑</label>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                      {/* Start Color */}
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px', display: 'block' }}>Start Color</label>
                        <div className="color-picker-wrapper">
                          <div 
                            className="color-preview-circle"
                            style={{ background: page?.customColors?.gradientStart || '#667eea' }}
                            onClick={() => setOpenColorPicker(openColorPicker === 'gradientStart' ? null : 'gradientStart')}
                          />
                          <input
                            type="text"
                            value={page?.customColors?.gradientStart || '#667eea'}
                            onChange={(e) => {
                              const start = e.target.value;
                              const end = page?.customColors?.gradientEnd || '#764ba2';
                              handleUpdatePage({ 
                                customColors: { 
                                  ...page?.customColors, 
                                  gradientStart: start,
                                  gradientEnd: end,
                                  background: `linear-gradient(to bottom, ${start} 0%, ${end} 100%)`
                                }
                              });
                            }}
                            className="color-input-text"
                            placeholder="#667eea"
                          />
                          {openColorPicker === 'gradientStart' && (
                            <div className="color-picker-popover">
                              <HexColorPicker 
                                color={tempColor || page?.customColors?.gradientStart || '#667eea'}
                                onChange={(color) => setTempColor(color)}
                              />
                              <button 
                                className="apply-color-btn"
                                onClick={() => {
                                  const start = tempColor;
                                  const end = page?.customColors?.gradientEnd || '#764ba2';
                                  handleUpdatePage({ 
                                    customColors: { 
                                      ...page?.customColors, 
                                      gradientStart: start,
                                      gradientEnd: end,
                                      background: `linear-gradient(to bottom, ${start} 0%, ${end} 100%)`
                                    }
                                  });
                                  setOpenColorPicker(null);
                                  setTempColor(null);
                                }}
                              >
                                ✓ Apply
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* End Color */}
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px', display: 'block' }}>End Color</label>
                        <div className="color-picker-wrapper">
                          <div 
                            className="color-preview-circle"
                            style={{ background: page?.customColors?.gradientEnd || '#764ba2' }}
                            onClick={() => setOpenColorPicker(openColorPicker === 'gradientEnd' ? null : 'gradientEnd')}
                          />
                          <input
                            type="text"
                            value={page?.customColors?.gradientEnd || '#764ba2'}
                            onChange={(e) => {
                              const start = page?.customColors?.gradientStart || '#667eea';
                              const end = e.target.value;
                              handleUpdatePage({ 
                                customColors: { 
                                  ...page?.customColors, 
                                  gradientStart: start,
                                  gradientEnd: end,
                                  background: `linear-gradient(to bottom, ${start} 0%, ${end} 100%)`
                                }
                              });
                            }}
                            className="color-input-text"
                            placeholder="#764ba2"
                          />
                          {openColorPicker === 'gradientEnd' && (
                            <div className="color-picker-popover">
                              <HexColorPicker 
                                color={tempColor || page?.customColors?.gradientEnd || '#764ba2'}
                                onChange={(color) => setTempColor(color)}
                              />
                              <button 
                                className="apply-color-btn"
                                onClick={() => {
                                  const start = page?.customColors?.gradientStart || '#667eea';
                                  const end = tempColor;
                                  handleUpdatePage({ 
                                    customColors: { 
                                      ...page?.customColors, 
                                      gradientStart: start,
                                      gradientEnd: end,
                                      background: `linear-gradient(to bottom, ${start} 0%, ${end} 100%)`
                                    }
                                  });
                                  setOpenColorPicker(null);
                                  setTempColor(null);
                                }}
                              >
                                ✓ Apply
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="helper-text" style={{ fontSize: '0.75rem' }}>
                      💡 Tip: Use the same color for both to create a solid background
                    </p>
                  </div>
                ) : (
                  <div className="color-picker-wrapper">
                    <div 
                      className="color-preview-circle"
                      style={{ background: page?.customColors?.background || '#ffffff' }}
                      onClick={() => setOpenColorPicker(openColorPicker === 'pageBg' ? null : 'pageBg')}
                    />
                    <input
                      type="text"
                      value={page?.customColors?.background || '#ffffff'}
                      onChange={(e) => handleUpdatePage({ 
                        customColors: { ...page?.customColors, background: e.target.value }
                      })}
                      className="color-input-text"
                      placeholder="#ffffff"
                    />
                    {openColorPicker === 'pageBg' && (
                      <div className="color-picker-popover">
                        <HexColorPicker 
                          color={tempColor || page?.customColors?.background || '#ffffff'}
                          onChange={(color) => setTempColor(color)}
                        />
                        <button 
                          className="apply-color-btn"
                          onClick={() => {
                            handleUpdatePage({ 
                              customColors: { ...page?.customColors, background: tempColor }
                            });
                            setOpenColorPicker(null);
                            setTempColor(null);
                          }}
                        >
                          ✓ Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={page?.hideBranding || false}
                    onChange={(e) => {
                      if (user?.plan === 'free') {
                        toast.error('Remove branding is a Pro feature. Upgrade to unlock!');
                      } else {
                        handleUpdatePage({ hideBranding: e.target.checked });
                      }
                    }}
                    disabled={user?.plan === 'free'}
                  />
                  <span>Hide "Create your own MyLinks" branding 👑</span>
                </label>
                <p className="helper-text">Remove branding from your page (Pro feature)</p>
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
                <label>Text Color</label>
                <div className="color-picker-wrapper">
                  <div 
                    className="color-preview-circle"
                    style={{ background: page?.customColors?.text || '#000000' }}
                    onClick={() => setOpenColorPicker(openColorPicker === 'text' ? null : 'text')}
                  />
                  <input
                    type="text"
                    value={page?.customColors?.text || '#000000'}
                    onChange={(e) => handleUpdatePage({ 
                      customColors: { ...page?.customColors, text: e.target.value }
                    })}
                    className="color-input-text"
                    placeholder="#000000"
                  />
                  {openColorPicker === 'text' && (
                    <div className="color-picker-popover">
                      <HexColorPicker 
                        color={tempColor || page?.customColors?.text || '#000000'}
                        onChange={(color) => setTempColor(color)}
                      />
                      <button 
                        className="apply-color-btn"
                        onClick={() => {
                          handleUpdatePage({ 
                            customColors: { ...page?.customColors, text: tempColor }
                          });
                          setOpenColorPicker(null);
                          setTempColor(null);
                        }}
                      >
                        ✓ Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Button Color</label>
                <div className="color-picker-wrapper">
                  <div 
                    className="color-preview-circle"
                    style={{ background: page?.customColors?.button || '#000000' }}
                    onClick={() => setOpenColorPicker(openColorPicker === 'button' ? null : 'button')}
                  />
                  <input
                    type="text"
                    value={page?.customColors?.button || '#000000'}
                    onChange={(e) => handleUpdatePage({ 
                      customColors: { ...page?.customColors, button: e.target.value }
                    })}
                    className="color-input-text"
                    placeholder="#000000"
                  />
                  {openColorPicker === 'button' && (
                    <div className="color-picker-popover">
                      <HexColorPicker 
                        color={tempColor || page?.customColors?.button || '#000000'}
                        onChange={(color) => setTempColor(color)}
                      />
                      <button 
                        className="apply-color-btn"
                        onClick={() => {
                          handleUpdatePage({ 
                            customColors: { ...page?.customColors, button: tempColor }
                          });
                          setOpenColorPicker(null);
                          setTempColor(null);
                        }}
                      >
                        ✓ Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Button Text Color</label>
                <div className="color-picker-wrapper">
                  <div 
                    className="color-preview-circle"
                    style={{ background: page?.customColors?.buttonText || '#ffffff' }}
                    onClick={() => setOpenColorPicker(openColorPicker === 'buttonText' ? null : 'buttonText')}
                  />
                  <input
                    type="text"
                    value={page?.customColors?.buttonText || '#ffffff'}
                    onChange={(e) => handleUpdatePage({ 
                      customColors: { ...page?.customColors, buttonText: e.target.value }
                    })}
                    className="color-input-text"
                    placeholder="#ffffff"
                  />
                  {openColorPicker === 'buttonText' && (
                    <div className="color-picker-popover">
                      <HexColorPicker 
                        color={tempColor || page?.customColors?.buttonText || '#ffffff'}
                        onChange={(color) => setTempColor(color)}
                      />
                      <button 
                        className="apply-color-btn"
                        onClick={() => {
                          handleUpdatePage({ 
                            customColors: { ...page?.customColors, buttonText: tempColor }
                          });
                          setOpenColorPicker(null);
                          setTempColor(null);
                        }}
                      >
                        ✓ Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Background Image</label>
                <div className="image-upload-section">
                  {page?.backgroundImage ? (
                    <div className="image-preview">
                      <img src={page.backgroundImage} alt="Background" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => handleUpdatePage({ backgroundImage: null })}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="upload-btn"
                      onClick={() => document.getElementById('bg-upload').click()}
                    >
                      <Upload size={20} />
                      Upload Background Image
                    </button>
                  )}
                  <input
                    id="bg-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          try {
                            await handleUpdatePage({ backgroundImage: event.target.result });
                            toast.success('Background image uploaded!');
                          } catch (error) {
                            toast.error('Failed to upload image');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }}
                  />
                  {!page?.backgroundImage && (
                    <span style={{ display: 'none' }}></span>
                  )}
                </div>
                {page?.backgroundImage && (
                  <div className="form-group">
                    <label>Background Style</label>
                    <select
                      value={page?.backgroundStyle || 'cover'}
                      onChange={(e) => handleUpdatePage({ backgroundStyle: e.target.value })}
                      className="select-input"
                    >
                      <option value="cover">Cover (Fill)</option>
                      <option value="contain">Contain (Fit)</option>
                      <option value="repeat">Repeat (Tile)</option>
                      <option value="fixed">Fixed (Parallax)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Button Animation</label>
                <select
                  value={page?.buttonAnimation || 'none'}
                  onChange={(e) => handleUpdatePage({ buttonAnimation: e.target.value })}
                  className="select-input"
                >
                  <option value="none">None</option>
                  <option value="pulse">Pulse</option>
                  <option value="bounce">Bounce</option>
                  <option value="shake">Shake</option>
                  <option value="glow">Glow</option>
                </select>
              </div>

              <div className="form-group">
                <label>Font Family 👑</label>
                {user?.plan === 'pro' ? (
                  <select
                    value={page?.font || 'system'}
                    onChange={(e) => handleUpdatePage({ font: e.target.value })}
                    className="select-input"
                  >
                    <option value="system">System Default</option>
                    <option value="inter">Inter (Modern)</option>
                    <option value="poppins">Poppins (Friendly)</option>
                    <option value="roboto">Roboto (Clean)</option>
                    <option value="montserrat">Montserrat (Bold)</option>
                    <option value="playfair">Playfair Display (Elegant)</option>
                  </select>
                ) : (
                  <div>
                    <select disabled className="select-input">
                      <option>System Default</option>
                    </select>
                    <small style={{ color: '#666' }}>Upgrade to Pro to unlock custom fonts</small>
                  </div>
                )}
              </div>

              {user?.plan === 'pro' && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={page?.hideBranding || false}
                      onChange={(e) => handleUpdatePage({ hideBranding: e.target.checked })}
                    />
                    <span>Hide "Powered by MyLinks" Branding 👑</span>
                  </label>
                </div>
              )}

              {user?.plan === 'pro' && (
                <div className="form-group">
                  <label>Custom CSS 👑</label>
                  <p className="helper-text" style={{ marginBottom: '8px' }}>
                    Add custom CSS to fully customize your page appearance
                  </p>
                  <textarea
                    value={page?.customCSS || ''}
                    onChange={(e) => setPage({ ...page, customCSS: e.target.value })}
                    onBlur={() => handleUpdatePage({ customCSS: page.customCSS })}
                    placeholder=".public-link { border-radius: 20px; }"
                    rows={6}
                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                  />
                </div>
              )}
              </>
              )}
            </div>

            <div className="section-card">
              <div 
                onClick={() => toggleSection('links')}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}
              >
                <h3 style={{ margin: 0 }}>Links</h3>
                {openSections.links ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {openSections.links && (
              <>
              <div style={{ marginBottom: '16px' }}>
                <button 
                  onClick={() => setShowAddLink(!showAddLink)} 
                  className="btn-primary btn-small"
                >
                  <Plus size={18} />
                  Add Link
                </button>
              </div>

              {showAddLink && (
                <form onSubmit={editingLink ? handleUpdateLink : handleAddLink} className="add-link-form">
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

                  {newLink.iconOnly && (
                    <div className="form-group">
                      <label>Icon Size: {newLink.iconSize}px</label>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={newLink.iconSize}
                        onChange={(e) => setNewLink({ ...newLink, iconSize: parseInt(e.target.value) })}
                        className="slider-input"
                      />
                      <small style={{ color: '#666', fontSize: '0.875rem' }}>
                        Adjust the size of your icon (30px - 100px)
                      </small>
                    </div>
                  )}

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
                    <button type="submit" className="btn-primary btn-small">
                      {editingLink ? 'Update' : 'Add'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowAddLink(false);
                        setEditingLink(null);
                        setNewLink({ title: '', url: '', icon: 'link', iconOnly: false, iconSize: 50, position: 'main' });
                      }} 
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
                  page?.links?.sort((a, b) => a.order - b.order).map((link) => (
                    <div 
                      key={link._id} 
                      className={`link-item ${draggedLink?._id === link._id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, link)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, link)}
                    >
                      <div className="drag-handle" title="Drag to reorder">
                        <GripVertical size={20} />
                      </div>
                      <div className="link-info">
                        <h4>{link.title}</h4>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-url">
                          {link.url}
                          <ExternalLink size={14} />
                        </a>
                        <span className="link-clicks">
                          {link.clicks} clicks
                          {link.schedule?.enabled && (
                            <span className="schedule-badge" title="Scheduled">
                              <Calendar size={12} />
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="link-actions">
                        <button 
                          onClick={() => handleEditLink(link)} 
                          className="btn-icon"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleScheduleLink(link)} 
                          className="btn-icon"
                          title="Schedule"
                        >
                          <Calendar size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteLink(link._id)} 
                          className="btn-icon"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              </>
              )}
            </div>

            {/* Content Blocks Section - Pro Only */}
            <div className="section-card">
              <div 
                onClick={() => toggleSection('contentBlocks')}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}
              >
                <h3 style={{ margin: 0 }}>Content Blocks 👑</h3>
                {openSections.contentBlocks ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {openSections.contentBlocks && (
              <>
              <div style={{ marginBottom: '16px' }}>
                <button 
                  onClick={() => {
                    if (user?.plan === 'free') {
                      toast.error('Content Blocks are a Pro feature! Upgrade to unlock.');
                    } else {
                      setShowAddBlock(!showAddBlock);
                    }
                  }}
                  className="btn-primary btn-small"
                >
                  <Plus size={18} />
                  Add Block
                </button>
              </div>

              {showAddBlock && (
                <form onSubmit={editingBlock ? handleUpdateBlock : handleAddBlock} className="add-link-form">
                  <div className="form-group">
                    <label>Layout</label>
                    <select
                      value={newBlock.layout}
                      onChange={(e) => setNewBlock({ ...newBlock, layout: e.target.value })}
                      className="select-input"
                    >
                      <option value="full">Full Width</option>
                      <option value="half">Half Width (2 columns)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={newBlock.title}
                      onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                      placeholder="e.g., Check out my Amazon list"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description (optional)</label>
                    <input
                      type="text"
                      value={newBlock.description}
                      onChange={(e) => setNewBlock({ ...newBlock, description: e.target.value })}
                      placeholder="e.g., My favorite products"
                    />
                  </div>

                  <div className="form-group">
                    <label>Image</label>
                    <p className="helper-text" style={{ marginBottom: '8px' }}>
                      📐 Recommended: 800x600px • Max 2MB • JPG, PNG, or WebP
                    </p>
                    <div className="image-upload-section">
                      {newBlock.imageUrl ? (
                        <div className="image-preview">
                          <img src={newBlock.imageUrl} alt="Block preview" />
                          <button 
                            type="button"
                            onClick={() => setNewBlock({ ...newBlock, imageUrl: '' })}
                            className="btn-secondary btn-small"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <label htmlFor="block-image-upload" className="upload-btn">
                            <Upload size={20} />
                            Upload Image
                          </label>
                          <input
                            id="block-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleBlockImageUpload}
                            style={{ display: 'none' }}
                          />
                          <span style={{ margin: '0 12px', color: '#999' }}>or</span>
                          <input
                            type="url"
                            value={newBlock.imageUrl}
                            onChange={(e) => setNewBlock({ ...newBlock, imageUrl: e.target.value })}
                            placeholder="Enter image URL"
                            style={{ flex: 1 }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Link URL (optional)</label>
                    <input
                      type="url"
                      value={newBlock.linkUrl}
                      onChange={(e) => setNewBlock({ ...newBlock, linkUrl: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Background Color</label>
                    <div className="color-picker-wrapper">
                      <div 
                        className="color-preview-circle"
                        style={{ background: newBlock.backgroundColor || '#ffffff' }}
                        onClick={() => setOpenColorPicker(openColorPicker === 'blockBg' ? null : 'blockBg')}
                      />
                      <input
                        type="text"
                        value={newBlock.backgroundColor || '#ffffff'}
                        onChange={(e) => setNewBlock({ ...newBlock, backgroundColor: e.target.value })}
                        className="color-input-text"
                        placeholder="#ffffff"
                      />
                      {openColorPicker === 'blockBg' && (
                        <div className="color-picker-popover">
                          <HexColorPicker 
                            color={tempColor || newBlock.backgroundColor || '#ffffff'}
                            onChange={(color) => setTempColor(color)}
                          />
                          <button 
                            className="apply-color-btn"
                            onClick={() => {
                              setNewBlock({ ...newBlock, backgroundColor: tempColor });
                              setOpenColorPicker(null);
                              setTempColor(null);
                            }}
                          >
                            ✓ Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Text Color</label>
                    <div className="color-picker-wrapper">
                      <div 
                        className="color-preview-circle"
                        style={{ background: newBlock.textColor || '#000000' }}
                        onClick={() => setOpenColorPicker(openColorPicker === 'blockText' ? null : 'blockText')}
                      />
                      <input
                        type="text"
                        value={newBlock.textColor || '#000000'}
                        onChange={(e) => setNewBlock({ ...newBlock, textColor: e.target.value })}
                        className="color-input-text"
                        placeholder="#000000"
                      />
                      {openColorPicker === 'blockText' && (
                        <div className="color-picker-popover">
                          <HexColorPicker 
                            color={tempColor || newBlock.textColor || '#000000'}
                            onChange={(color) => setTempColor(color)}
                          />
                          <button 
                            className="apply-color-btn"
                            onClick={() => {
                              setNewBlock({ ...newBlock, textColor: tempColor });
                              setOpenColorPicker(null);
                              setTempColor(null);
                            }}
                          >
                            ✓ Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary btn-small">
                      {editingBlock ? 'Update Block' : 'Add Block'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowAddBlock(false);
                        setEditingBlock(null);
                        setNewBlock({ 
                          type: 'image', 
                          title: '', 
                          description: '', 
                          imageUrl: '', 
                          linkUrl: '', 
                          backgroundColor: '#ffffff',
                          textColor: '#000000',
                          layout: 'full'
                        });
                      }} 
                      className="btn-secondary btn-small"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="links-list">
                {page?.contentBlocks?.length === 0 ? (
                  <p className="empty-state">No content blocks yet. Add rich media cards to showcase your content! 👑</p>
                ) : (
                  page?.contentBlocks?.map((block) => (
                    <div key={block._id} className="link-item">
                      <div className="link-info">
                        <img 
                          src={block.imageUrl} 
                          alt={block.title}
                          style={{ 
                            width: 60, 
                            height: 60, 
                            objectFit: 'cover', 
                            borderRadius: 8,
                            marginRight: 12
                          }}
                        />
                        <div>
                          <strong>{block.title}</strong>
                          {block.description && <p style={{ fontSize: '0.875rem', color: '#666', margin: '4px 0 0 0' }}>{block.description}</p>}
                          <span style={{ fontSize: '0.75rem', color: '#999' }}>
                            {block.layout === 'full' ? 'Full Width' : 'Half Width'}
                          </span>
                        </div>
                      </div>
                      <div className="link-actions">
                        <button 
                          onClick={() => handleEditBlock(block)} 
                          className="btn-icon"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBlock(block._id)} 
                          className="btn-icon"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              </>
              )}
            </div>

            <div className="section-card">
              <div 
                onClick={() => toggleSection('seo')}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}
              >
                <h3 style={{ margin: 0 }}>SEO & Social Sharing</h3>
                {openSections.seo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {openSections.seo && (
              <>
              <div className="form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  value={page?.seo?.metaTitle || ''}
                  onChange={(e) => setPage({ ...page, seo: { ...page.seo, metaTitle: e.target.value } })}
                  onBlur={() => handleUpdatePage({ seo: page.seo })}
                  placeholder="Your Page Title - MyLinks"
                  maxLength={60}
                />
                <small>{(page?.seo?.metaTitle || '').length}/60 characters</small>
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  value={page?.seo?.metaDescription || ''}
                  onChange={(e) => setPage({ ...page, seo: { ...page.seo, metaDescription: e.target.value } })}
                  onBlur={() => handleUpdatePage({ seo: page.seo })}
                  placeholder="A brief description of your page for search engines and social media"
                  rows={3}
                  maxLength={160}
                />
                <small>{(page?.seo?.metaDescription || '').length}/160 characters</small>
              </div>

              <div className="form-group">
                <label>Social Preview Image</label>
                <p className="helper-text">This image appears when your link is shared on social media (recommended: 1200x630px)</p>
                <div className="avatar-upload">
                  {page?.seo?.metaImage ? (
                    <img src={page.seo.metaImage} alt="Social preview" style={{ width: '200px', height: 'auto', borderRadius: '8px' }} />
                  ) : (
                    <div className="avatar-placeholder" style={{ width: '200px', height: '105px', borderRadius: '8px' }}>No preview image</div>
                  )}
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('seo-image-upload').click()}
                    className="upload-btn"
                  >
                    <Upload size={20} />
                    Upload Image
                  </button>
                  <input
                    id="seo-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error('Image must be less than 2MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        try {
                          await handleUpdatePage({ seo: { ...page.seo, metaImage: reader.result } });
                          toast.success('Social preview image updated!');
                        } catch (error) {
                          toast.error('Failed to upload image');
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              </>
              )}
            </div>
          </div>

          <div className="preview-section">
            <div className="preview-header">
              <h3>Preview</h3>
            </div>
            <div className="phone-preview">
              {page?.coverPhoto && (
                <div 
                  className="preview-cover"
                  style={{ backgroundImage: `url(${page.coverPhoto})` }}
                ></div>
              )}
              <div 
                className="preview-content"
                style={{
                  background: page?.customColors?.background || '#ffffff',
                  color: page?.customColors?.text || '#000000',
                  paddingTop: page?.coverPhoto ? '80px' : '40px',
                  fontFamily: page?.font === 'inter' ? 'Inter, sans-serif' :
                              page?.font === 'poppins' ? 'Poppins, sans-serif' :
                              page?.font === 'roboto' ? 'Roboto, sans-serif' :
                              page?.font === 'montserrat' ? 'Montserrat, sans-serif' :
                              page?.font === 'playfair' ? 'Playfair Display, serif' :
                              'system-ui, -apple-system, sans-serif'
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
                <div className="preview-links" style={{ 
                  display: 'flex', 
                  flexDirection: page?.links?.some(l => l.iconOnly) ? 'row' : 'column',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  {page?.links?.map((link) => {
                    const iconOption = iconOptions.find(opt => opt.name === link.icon);
                    const iconData = iconOption ? { type: iconOption.type, icon: iconOption.icon } : { type: 'react', icon: FaLink };
                    const size = link.iconSize || 50;
                    
                    // If icon-only, show as circular icon
                    if (link.iconOnly) {
                      return (
                        <div 
                          key={link._id} 
                          className="preview-icon-only"
                          style={{
                            width: size * 0.4,
                            height: size * 0.4,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {iconData.type === 'image' ? (
                            <img src={iconData.icon} alt={link.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <iconData.icon size={size * 0.3} />
                          )}
                        </div>
                      );
                    }
                    
                    // Regular link with text
                    return (
                      <div 
                        key={link._id} 
                        className={`preview-link preview-button-${page?.buttonStyle || 'rounded'}`}
                        style={{
                          background: page?.customColors?.button || '#000000',
                          color: page?.customColors?.buttonText || '#ffffff'
                        }}
                      >
                        {iconData.type === 'image' ? (
                          <img src={iconData.icon} alt={link.title} style={{ width: 16, height: 16 }} />
                        ) : (
                          <iconData.icon size={16} />
                        )}
                        <span>{link.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Content Blocks Preview */}
                {page?.contentBlocks && page.contentBlocks.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    marginTop: '16px',
                    width: '100%'
                  }}>
                    {page.contentBlocks.map((block) => (
                      <div 
                        key={block._id}
                        style={{
                          width: block.layout === 'half' ? 'calc(50% - 4px)' : '100%',
                          backgroundColor: block.backgroundColor,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          fontSize: '0.75rem'
                        }}
                      >
                        <div style={{ 
                          width: '100%', 
                          height: '60px', 
                          background: '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {block.imageUrl && (
                            <img 
                              src={block.imageUrl} 
                              alt={block.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }}
                            />
                          )}
                        </div>
                        <div style={{ padding: '6px' }}>
                          <strong style={{ fontSize: '0.7rem' }}>{block.title}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCropModal && imageToCrop && (
        <ImageCropModal
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCropModal(false);
            setImageToCrop(null);
          }}
          aspectRatio={16 / 9}
        />
      )}

      {showQRCode && (
        <div className="qr-modal-overlay" onClick={() => setShowQRCode(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>Your QR Code</h3>
              <button onClick={() => setShowQRCode(false)} className="close-btn">×</button>
            </div>
            <div className="qr-modal-content">
              <QRCodeSVG 
                id="qr-code-svg"
                value={`${window.location.origin}/${user.username}`}
                size={256}
                level="H"
                includeMargin={true}
              />
              <p className="qr-url">mylinks.com/{user.username}</p>
            </div>
            <div className="qr-modal-actions">
              <button onClick={downloadQRCode} className="btn-primary">
                <Download size={18} />
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && selectedLink && (
        <ScheduleModal
          link={selectedLink}
          onSave={handleSaveSchedule}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedLink(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
