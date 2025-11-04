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
      link: FaLink,
      facebook: FaFacebook,
      twitter: FaTwitter,
      instagram: FaInstagram,
      youtube: FaYoutube,
      tiktok: FaTiktok,
      linkedin: FaLinkedin,
      reddit: FaReddit,
      github: FaGithub,
      discord: FaDiscord,
      twitch: FaTwitch,
      spotify: FaSpotify
    };
    return icons[iconName] || FaLink;
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
      default: { background: '#ffffff', text: '#000000' },
      dark: { background: '#1a1a1a', text: '#ffffff' },
      gradient: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff' },
      minimal: { background: '#f9fafb', text: '#000000' }
    };
    return themes[theme] || themes.default;
  };

  const getButtonClass = () => {
    const style = page.buttonStyle || 'rounded';
    return `public-link button-${style}`;
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
  const pageStyle = {
    background: page.customColors?.background || themeStyles.background,
    color: page.customColors?.text || themeStyles.text,
    fontFamily: getFontFamily()
  };

  return (
    <div className="public-page" style={pageStyle}>
      <div className="public-content">
        {page.avatar && (
          <img src={page.avatar} alt={page.title} className="public-avatar" />
        )}
        {!page.avatar && <div className="public-avatar-placeholder"></div>}
        
        <h1 style={{ color: page.customColors?.text || '#000000' }}>
          {page.title}
        </h1>
        
        {page.bio && (
          <p className="public-bio" style={{ color: page.customColors?.text || '#666666' }}>
            {page.bio}
          </p>
        )}

        <div className="public-links">
          {page.links
            .filter(link => link.isActive)
            .sort((a, b) => a.order - b.order)
            .map((link) => {
              const IconComponent = getIcon(link.icon);
              return (
                <button
                  key={link._id}
                  onClick={() => handleLinkClick(link._id, link.url)}
                  className={getButtonClass()}
                  style={{
                    background: page.customColors?.button || '#000000',
                    color: page.customColors?.buttonText || '#ffffff'
                  }}
                >
                  <div className="link-content">
                    <IconComponent size={20} className="link-icon" />
                    <span>{link.title}</span>
                  </div>
                  <ExternalLink size={18} />
                </button>
              );
            })}
        </div>

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
