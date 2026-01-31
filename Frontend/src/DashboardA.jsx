import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaSeedling, FaShoppingBasket, FaCalendarAlt, FaSignOutAlt, FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

function DashboardA() {
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
        <div className="logo">{t('agri')} Farmer</div>
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
          <button onClick={() => navigate('/plant-diseases')}>
            <FaLeaf style={{ marginRight: '10px' }} />
            {t('plantDiseases')}
          </button>
          <button onClick={() => navigate('/farmer-profile')}>
            <FaSeedling style={{ marginRight: '10px' }} />
            {t('myProducts')}
          </button>
          <button onClick={() => navigate('/crop-rotation')}>
            <FaCalendarAlt style={{ marginRight: '10px' }} />
            {t('cropRotation')}
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt style={{ marginRight: '10px' }} />
            {t('logout')}
          </button>
        </div>
      </nav>
      
      <div className="dashboard-content">
        <div className="welcome-message">
          <h2>Welcome {userName}!</h2>
          <p>{t('manageActivities')}</p>
        </div>
        
        <div className="quick-actions">
          <div className="action-card" onClick={() => navigate('/plant-diseases')}>
            <div className="action-icon">
              <FaLeaf />
            </div>
            <h3>{t('detectPlantDiseases')}</h3>
            <p>{t('uploadImages')}</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/farmer-profile')}>
            <div className="action-icon">
              <FaSeedling />
            </div>
            <h3>{t('manageMyProducts')}</h3>
            <p>{t('addEditProducts')}</p>
          </div>

          <div className="action-card" onClick={() => navigate('/crop-rotation')}>
            <div className="action-icon">
              <FaCalendarAlt />
            </div>
            <h3>{t('cropRotationPlanner')}</h3>
            <p>{t('planRotation')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardA;