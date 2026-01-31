import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBasket, FaUser, FaSignOutAlt, FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

function DashboardB() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="logo">{t('agri')} Customer</div>
        <div className="nav-links">
          <div className="language-switcher">
            <FaGlobe style={{ marginRight: '5px' }} />
            <select 
              value={i18n.language} 
              onChange={(e) => changeLanguage(e.target.value)}
              className="language-select"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
          <button onClick={() => navigate('/marketplace')}>
            <FaShoppingBasket style={{ marginRight: '10px' }} />
            {t('marketplace')}
          </button>
          <button onClick={() => navigate('/profile')}>
            <FaUser style={{ marginRight: '10px' }} />
            {t('profile')}
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt style={{ marginRight: '10px' }} />
            {t('logout')}
          </button>
        </div>
      </nav>
      
      <div className="dashboard-content">
        <div className="welcome-message">
          <h2>{t('welcome')}{userName}!</h2>
          <p>{t('exploreProducts')}</p>
        </div>
        
        <div className="quick-actions">
          <div className="action-card" onClick={() => navigate('/marketplace')}>
            <div className="action-icon">
              <FaShoppingBasket />
            </div>
            <h3>{t('browseMarketplace')}</h3>
            <p>{t('discoverProduce')}</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/profile')}>
            <div className="action-icon">
              <FaUser />
            </div>
            <h3>{t('myProfile')}</h3>
            <p>{t('manageAccount')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardB;