import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';
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
      }
    };
    return themes[theme] || themes.default;
  };

  const getButtonClass = () => {
    const style = page.buttonStyle || 'rounded';
    const theme = page.theme || 'default';
    let className = `public-link button-${style}`;
    if (theme === 'minimal') {
      className += ' button-outlined';
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
  
  // Use custom colors if they differ from default, otherwise use theme
  const hasCustomBackground = page.customColors?.background && page.customColors.background !== '#ffffff';
  const hasCustomText = page.customColors?.text && page.customColors.text !== '#000000';
  const hasCustomButton = page.customColors?.button && page.customColors.button !== '#000000';
  const hasCustomButtonText = page.customColors?.buttonText && page.customColors.buttonText !== '#ffffff';
  
  const pageStyle = {
    background: hasCustomBackground ? page.customColors.background : themeStyles.background,
    color: hasCustomText ? page.customColors.text : themeStyles.text,
    fontFamily: getFontFamily()
  };
  
  const buttonStyle = {
    background: hasCustomButton ? page.customColors.button : themeStyles.button,
    color: hasCustomButtonText ? page.customColors.buttonText : themeStyles.buttonText
  };

  return (
    <div className="public-page" style={pageStyle}>
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
        {page.links.filter(link => link.isActive && link.position === 'top').length > 0 && (
          <div className="icon-links top-icons">
            {page.links
              .filter(link => link.isActive && link.position === 'top')
              .sort((a, b) => a.order - b.order)
              .map((link) => {
                const iconData = getIcon(link.icon);
                return (
                  <button
                    key={link._id}
                    onClick={() => handleLinkClick(link._id, link.url)}
                    className="icon-only-link"
                    style={buttonStyle}
                    title={link.title}
                  >
                    {iconData.type === 'image' ? (
                      <img src={iconData.icon} alt={link.title} style={{ width: 24, height: 24 }} />
                    ) : (
                      <iconData.icon size={24} />
                    )}
                  </button>
                );
              })}
          </div>
        )}

        {/* Main Links */}
        <div className="public-links">
          {page.links
            .filter(link => link.isActive && (!link.position || link.position === 'main'))
            .sort((a, b) => a.order - b.order)
            .map((link) => {
              const iconData = getIcon(link.icon);
              if (link.iconOnly === true) {
                return (
                  <button
                    key={link._id}
                    onClick={() => handleLinkClick(link._id, link.url)}
                    className="icon-only-link-main"
                    style={buttonStyle}
                    title={link.title}
                  >
                    {iconData.type === 'image' ? (
                      <img src={iconData.icon} alt={link.title} style={{ width: 28, height: 28 }} />
                    ) : (
                      <iconData.icon size={28} />
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

        {/* Bottom Icons */}
        {page.links.filter(link => link.isActive && link.position === 'bottom').length > 0 && (
          <div className="icon-links bottom-icons">
            {page.links
              .filter(link => link.isActive && link.position === 'bottom')
              .sort((a, b) => a.order - b.order)
              .map((link) => {
                const iconData = getIcon(link.icon);
                return (
                  <button
                    key={link._id}
                    onClick={() => handleLinkClick(link._id, link.url)}
                    className="icon-only-link"
                    style={buttonStyle}
                    title={link.title}
                  >
                    {iconData.type === 'image' ? (
                      <img src={iconData.icon} alt={link.title} style={{ width: 24, height: 24 }} />
                    ) : (
                      <iconData.icon size={24} />
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

        <div className="powered-by">
          <a href="/" target="_blank" rel="noopener noreferrer">
            Create your own MyLinks
          </a>
        </div>
      </div>
    </div>
  );
};

export default PublicPage;
