import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { AiOutlineMail, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiLockAlt } from "react-icons/bi";
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('farmer');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Starting login process...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth successful:', userCredential.user.uid);
      
      // Use the userType selected on login form
      const userData = {
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || email.split('@')[0],
        userType: userType
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      // Navigate based on login form selection
      navigate(userType === 'farmer' ? '/dashboardA' : '/dashboardB');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="logo">Agri Connect</h1>

        <div className="user-type-toggle">
          <button className={userType === 'farmer' ? 'active' : ''} onClick={() => setUserType('farmer')}>Farmer</button>
          <button className={userType === 'customer' ? 'active' : ''} onClick={() => setUserType('customer')}>Customer</button>
        </div>

        <h2>Welcome Back, {userType === 'farmer' ? 'Farmer' : 'Customer'}</h2>
        <p>Login to continue your journey</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="input-field" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group password-wrapper">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>

        <p className="signup-text">Don't have an account? <a href="/signup">Sign up</a></p>
      </div>
    </div>
  );
}

export default Login;