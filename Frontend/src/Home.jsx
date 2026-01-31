import React from 'react'
import './Home.css'
import Login from './Login'
import visitPlatform from './images/visit-platform.jpg';
import createAccount from './images/create-account.jpg';
import aiDiagnosis from './images/ai-diagnosis.jpg';
import buySell from './images/buy-sell.jpg';
import smartRecommendation from './images/smart-recommendation.jpg';
import secureTransactions from './images/secure-transactions.jpg';
import communitySupport from './images/community-support.jpg';
import sustainableAgriculture from './images/sustainable-agriculture.jpg';

function Home() {
  return (
    <div className="home-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo"><span className="highlight">Agri Connect</span></div>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
          <a href="#login" style={{ cursor: 'pointer' }}>Sign In</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero" id="home">
        <h1>
          Welcome to <span className="highlight">Agri Connect</span>
        </h1>
        <p>
          Empowering Farmers with AI-Driven Insights for Better Agriculture.
        </p>
        <a href="#login">
          <button className="explore-button">
            Explore Now
          </button>
        </a>
      </main>

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2 className="section-title">Why Choose Agri Connect?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <img src={visitPlatform} alt="Visit Platform" className="feature-image" />
            <h3>1️⃣ Visit the Platform</h3>
            <p>Access Agri Connect through your browser or mobile device.</p>
          </div>
          <div className="feature-card">
            <img src={createAccount} alt="Create Account" className="feature-image" />
            <h3>2️⃣ Create Your Account</h3>
            <p>Sign up as a farmer or customer to get started.</p>
          </div>
          <div className="feature-card">
            <img src={aiDiagnosis} alt="AI Diagnosis" className="feature-image" />
            <h3>3️⃣ AI-Powered Crop Diagnosis</h3>
            <p>Upload images of crops to detect diseases and get treatment suggestions.</p>
          </div>
          <div className="feature-card">
            <img src={buySell} alt="Buy and Sell" className="feature-image" />
            <h3>4️⃣ Buy & Sell Farm Produce</h3>
            <p>Farmers can list fresh produce, and customers can buy directly from them.</p>
          </div>
          <div className="feature-card">
            <img src={smartRecommendation} alt="Smart Recommendations" className="feature-image" />
            <h3>5️⃣ Smart Recommendations</h3>
            <p>Receive AI-driven suggestions for fertilizers based on soil and crop data.</p>
          </div>
          <div className="feature-card">
            <img src={secureTransactions} alt="Secure Transactions" className="feature-image" />
            <h3>6️⃣ Secure Transactions</h3>
            <p>Use Razorpay for secure and seamless payments.</p>
          </div>
          <div className="feature-card">
            <img src={communitySupport} alt="Community Support" className="feature-image" />
            <h3>7️⃣ Community Support</h3>
            <p>Connect with fellow farmers and customers for knowledge sharing.</p>
          </div>
          <div className="feature-card">
            <img src={sustainableAgriculture} alt="Sustainable Agriculture" className="feature-image" />
            <h3>🌱 Sustainable Agriculture</h3>
            <p>Leverage AI to optimize resources and improve crop yield.</p>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login">
        <Login />
      </section>

      {/* Contact Section */}
      <div className="hii">
      <section id="contact" className="contact-section">
        <h2>Contact Us</h2>
        <p>Email: support@agriai.com</p>
        <p>Phone: +91 9876543210</p>
      </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Agri Connect. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Home