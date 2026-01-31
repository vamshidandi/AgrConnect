import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import "./Profile.css";

const Profile = () => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState({
    name: "",
    mobile: "",
    email: "",
    location: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          setProfileData({
            name: user.name || "",
            mobile: "",
            email: user.email || "",
            location: "",
            bio: "",
          });
        }
      } catch (err) {
        setError(t('profileLoadError'));
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // For now, just save to localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess(t('profileUpdatedSuccess'));
    } catch (err) {
      setError(t('profileUpdateError'));
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.name) {
    return <div className="loading">{t('loadingProfile')}</div>;
  }

  return (
    <div className="profile-container">
      <h2>{t('userProfile')}</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form className="profile-form" onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="name">{t('name')}:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profileData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobile">{t('mobileNumber')}:</label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={profileData.mobile}
            onChange={handleChange}
            pattern="[0-9]{10}"
            title="Please enter a 10-digit mobile number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">{t('email')}:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">{t('location')}:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={profileData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">{t('bio')}:</label>
          <textarea
            id="bio"
            name="bio"
            value={profileData.bio}
            onChange={handleChange}
            placeholder={t('tellAboutYourself')}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? t('saving') : t('saveChanges')}
        </button>
      </form>
    </div>
  );
};

export default Profile;