import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { ExternalLink, Eye } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaLinkedin, FaReddit, FaGithub, FaDiscord, FaTwitch, FaSpotify, FaLink } from 'react-icons/fa';
import './PublicPage.css';

const PublicPage = () => {
  const { username } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPage();
  }, [username]);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`${API_URL}/pages/${username}`);
      setPage(response.data.page);
    } catch (error) {
      console.error('Fetch page error:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      link: { type: 'react', icon: FaLink },
      facebook: { type: 'react', icon: FaFacebook },
      fb: { type: 'image', icon: '/icons/fb.png' },
      twitter: { type: 'react', icon: FaTwitter },
      x: { type: 'image', icon: '/icons/x.png' },
      instagram: { type: 'react', icon: FaInstagram },
      insta: { type: 'image', icon: '/icons/insta.png' },
      youtube: { type: 'react', icon: FaYoutube },
      yt: { type: 'image', icon: '/icons/yt.png' },
      tiktok: { type: 'react', icon: FaTiktok },
      'tiktok-custom': { type: 'image', icon: '/icons/tiktok.png' },
      linkedin: { type: 'react', icon: FaLinkedin },
      reddit: { type: 'react', icon: FaReddit },
      github: { type: 'react', icon: FaGithub },
      discord: { type: 'react', icon: FaDiscord },
      'discord-custom': { type: 'image', icon: '/icons/discord.png' },
      twitch: { type: 'react', icon: FaTwitch },
      'twitch-custom': { type: 'image', icon: '/icons/twitch.png' },
      spotify: { type: 'react', icon: FaSpotify },
      snapchat: { type: 'image', icon: '/icons/snapchat.png' },
      telegram: { type: 'image', icon: '/icons/telegram.png' },
      pinterest: { type: 'image', icon: '/icons/pinterest.png' },
      onlyfans: { type: 'image', icon: '/icons/of.png' }
    };
    return icons[iconName] || { type: 'react', icon: FaLink };
  };

  const isLinkVisible = (link) => {
    if (!link.isActive) return false;
    
    // Check if link has scheduling enabled
    if (link.schedule?.enabled) {
      const now = new Date();
      const startDate = link.schedule.startDate ? new Date(link.schedule.startDate) : null;
      const endDate = link.schedule.endDate ? new Date(link.schedule.endDate) : null;
      
      if (startDate && now < startDate) return false;
      if (endDate && now > endDate) return false;
    }
    
    return true;
  };

  const handleLinkClick = async (linkId, url) => {
    // Track click
    try {
      await axios.post(`${API_URL}/pages/${username}/links/${linkId}/click`);
    } catch (error) {
      console.error('Track click error:', error);
    }
    // Open link
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="public-page loading-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="public-page not-found">
        <h1>404</h1>
        <p>Page not found</p>
        <a href="/" className="btn-primary">Go to MyLinks</a>
      </div>
    );
  }

  const getThemeStyles = () => {
    const theme = page.theme || 'default';
    const themes = {
      default: { 
        background: '#ffffff', 
        text: '#000000',
        button: '#000000',
        buttonText: '#ffffff'
      },
      dark: { 
        background: '#1a1a1a', 
        text: '#ffffff',
        button: '#ffffff',
        buttonText: '#000000'
      },
      gradient: { 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        text: '#ffffff',
        button: '#ffffff',
        buttonText: '#764ba2'
      },
      minimal: { 
        background: '#f9fafb', 
        text: '#000000',
        button: 'transparent',
        buttonText: '#000000'
      },
      neon: {
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
        text: '#00ff88',
        button: '#00ff88',
        buttonText: '#0f0f23'
      },
      sunset: {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
        text: '#ffffff',
        button: '#ffffff',
        buttonText: '#ff6b6b'
      },
      ocean: {
        background: 'linear-gradient(135deg, #0077be 0%, #00d4ff 100%)',
        text: '#ffffff',
        button: '#ffffff',
        buttonText: '#0077be'
      },
      forest: {
        background: 'linear-gradient(135deg, #134e4a 0%, #10b981 100%)',
        text: '#ffffff',
        button: '#ffffff',
        buttonText: '#134e4a'
      }
    };
    return themes[theme] || themes.default;
  };

  const getButtonClass = () => {
    const style = page.buttonStyle || 'rounded';
    const theme = page.theme || 'default';
    const animation = page.buttonAnimation || 'none';
    let className = `public-link button-${style}`;
    if (theme === 'minimal') {
      className += ' button-outlined';
    }
    if (animation !== 'none') {
      className += ` animate-${animation}`;
    }
    return className;
  };

  const getFontFamily = () => {
    const fonts = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      inter: '"Inter", sans-serif',
      poppins: '"Poppins", sans-serif',
      roboto: '"Roboto", sans-serif',
      montserrat: '"Montserrat", sans-serif',
      playfair: '"Playfair Display", serif'
    };
    return fonts[page.font] || fonts.system;
  };

  const themeStyles = getThemeStyles();
  
  // Use custom colors if they exist
  const hasCustomBackground = page.customColors?.background;
  const hasCustomText = page.customColors?.text;
  const hasCustomButton = page.customColors?.button;
  const hasCustomButtonText = page.customColors?.buttonText;
  
  const pageStyle = {
    background: hasCustomBackground ? page.customColors.background : themeStyles.background,
    ...(page.backgroundImage && {
      backgroundImage: `url(${page.backgroundImage})`,
      backgroundSize: page.backgroundStyle === 'cover' ? 'cover' : page.backgroundStyle === 'contain' ? 'contain' : 'auto',
      backgroundRepeat: page.backgroundStyle === 'repeat' ? 'repeat' : 'no-repeat',
      backgroundAttachment: page.backgroundStyle === 'fixed' ? 'fixed' : 'scroll',
      backgroundPosition: 'center'
    }),
    color: hasCustomText ? page.customColors.text : themeStyles.text,
    fontFamily: getFontFamily()
  };
  
  const buttonStyle = {
    background: hasCustomButton ? page.customColors.button : themeStyles.button,
    color: hasCustomButtonText ? page.customColors.buttonText : themeStyles.buttonText
  };

  const metaTitle = page.seo?.metaTitle || `${page.title} - MyLinks`;
  const metaDescription = page.seo?.metaDescription || page.bio || `Check out ${page.title}'s links`;
  const metaImage = page.seo?.metaImage || page.coverPhoto || page.avatar || `${window.location.origin}/logo.png`;
  const pageUrl = window.location.href;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={pageUrl} />
        <meta property="twitter:title" content={metaTitle} />
        <meta property="twitter:description" content={metaDescription} />
        <meta property="twitter:image" content={metaImage} />
      </Helmet>
      
      <div className="public-page" style={pageStyle}>
        {page.coverPhoto && (
          <div className="public-cover" style={{ backgroundImage: `url(${page.coverPhoto})` }}></div>
        )}
        <div className="public-content">
        {page.avatar && (
          <img src={page.avatar} alt={page.title} className="public-avatar" />
        )}
        {!page.avatar && <div className="public-avatar-placeholder"></div>}
        
        <h1 style={{ color: hasCustomText ? page.customColors.text : themeStyles.text }}>
          {page.title}
        </h1>
        
        {page.bio && (
          <p className="public-bio" style={{ color: hasCustomText ? page.customColors.text : themeStyles.text, opacity: 0.8 }}>
            {page.bio}
          </p>
        )}

        {/* Top Icons */}
        {page.links.filter(link => isLinkVisible(link) && link.position === 'top').length > 0 && (
          <div className="icon-links top-icons">
            {page.links
              .filter(link => isLinkVisible(link) && link.position === 'top')
              .sort((a, b) => a.order - b.order)
              .map((link) => {
                const iconData = getIcon(link.icon);
                const size = link.iconSize || 50;
                return (
                  <button
                    key={link._id}
                    onClick={() => handleLinkClick(link._id, link.url)}
                    className="icon-only-link"
                    style={{ ...buttonStyle, width: size, height: size }}
                    title={link.title}
                  >
                    {iconData.type === 'image' ? (
                      <img src={iconData.icon} alt={link.title} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <iconData.icon size={size * 0.6} />
                    )}
                  </button>
                );
              })}
          </div>
        )}

        {/* Main Links */}
        <div className="public-links">
          {page.links
            .filter(link => isLinkVisible(link) && (!link.position || link.position === 'main'))
            .sort((a, b) => a.order - b.order)
            .map((link) => {
              const iconData = getIcon(link.icon);
              if (link.iconOnly === true) {
                const size = link.iconSize || 60;
                return (
                  <button
                    key={link._id}
                    onClick={() => handleLinkClick(link._id, link.url)}
                    className="icon-only-link-main"
                    style={{ ...buttonStyle, width: size, height: size }}
                    title={link.title}
                  >
                    {iconData.type === 'image' ? (
                      <img src={iconData.icon} alt={link.title} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <iconData.icon size={size * 0.6} />
                    )}
                  </button>
                );
              }
              return (
                <button
                  key={link._id}
                  onClick={() => handleLinkClick(link._id, link.url)}
                  className={getButtonClass()}
                  style={buttonStyle}
                >
                  <div className="link-content">
                    {iconData.type === 'image' ? (
                      <img src={iconData.icon} alt={link.title} className="link-icon" style={{ width: 20, height: 20 }} />
                    ) : (
                      <iconData.icon size={20} className="link-icon" />
                    )}
                    <span>{link.title}</span>
                  </div>
                  <ExternalLink size={18} />
                </button>
              );
            })}
        </div>

        {/* Content Blocks */}
        {page.contentBlocks && page.contentBlocks.length > 0 && (
          <div className="content-blocks-container">
            {page.contentBlocks
              .filter(block => block.isActive)
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <div 
                  key={block._id} 
                  className={`content-block ${block.layout === 'half' ? 'half-width' : 'full-width'}`}
                  style={{ backgroundColor: block.backgroundColor }}
                  onClick={() => block.linkUrl && window.open(block.linkUrl, '_blank')}
                >
                  <div className="content-block-image">
                    <img src={block.imageUrl} alt={block.title} />
                  </div>
                  <div className="content-block-text" style={{ color: block.textColor || '#1a1a1a' }}>
                    <h3 style={{ color: block.textColor || '#1a1a1a' }}>{block.title}</h3>
                    {block.description && <p style={{ color: block.textColor || '#666' }}>{block.description}</p>}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Bottom Icons */}
        {page.links.filter(link => isLinkVisible(link) && link.position === 'bottom').length > 0 && (
          <div className="icon-links bottom-icons">
            {page.links
              .filter(link => isLinkVisible(link) && link.position === 'bottom')
              .sort((a, b) => a.order - b.order)
              .map((link) => {
                const iconData = getIcon(link.icon);
                const size = link.iconSize || 50;
                return (
                  <button
                    key={link._id}
                    onClick={() => handleLinkClick(link._id, link.url)}
                    className="icon-only-link"
                    style={{ ...buttonStyle, width: size, height: size }}
                    title={link.title}
                  >
                    {iconData.type === 'image' ? (
                      <img src={iconData.icon} alt={link.title} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <iconData.icon size={size * 0.6} />
                    )}
                  </button>
                );
              })}
          </div>
        )}

        {page.socialLinks && (
          <div className="social-links">
            {page.socialLinks.twitter && (
              <a href={page.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            )}
            {page.socialLinks.instagram && (
              <a href={page.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            {page.socialLinks.youtube && (
              <a href={page.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            )}
          </div>
        )}

        {/* Share Buttons */}
        <div className="share-section">
          <h4>Share this page</h4>
          <div className="share-buttons">
            <button
              className="share-btn x"
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(page.title)}`, '_blank')}
              title="Share on X"
            >
              <img src="/icons/x.png" alt="X" style={{ width: '20px', height: '20px' }} />
            </button>
            <button
              className="share-btn facebook"
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              title="Share on Facebook"
            >
              <FaFacebook size={20} />
            </button>
            <button
              className="share-btn linkedin"
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              title="Share on LinkedIn"
            >
              <FaLinkedin size={20} />
            </button>
            <button
              className="share-btn copy"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              title="Copy link"
            >
              <FaLink size={20} />
            </button>
          </div>
        </div>

        {/* Visitor Counter */}
        <div className="visitor-counter">
          <Eye size={16} />
          <span>{page.views.toLocaleString()} views</span>
        </div>

        {!page.hideBranding && (
          <div className="powered-by">
            <a href="/" target="_blank" rel="noopener noreferrer">
              Create your own MyLinks
            </a>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default PublicPage;
