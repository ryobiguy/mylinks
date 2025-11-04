import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';
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

  return (
    <div className="public-page" style={{ background: page.customColors?.background || '#ffffff' }}>
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
            .map((link) => (
              <button
                key={link._id}
                onClick={() => handleLinkClick(link._id, link.url)}
                className="public-link"
                style={{
                  background: page.customColors?.button || '#000000',
                  color: page.customColors?.buttonText || '#ffffff'
                }}
              >
                <span>{link.title}</span>
                <ExternalLink size={18} />
              </button>
            ))}
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
