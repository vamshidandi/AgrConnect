import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "./FarmerProfile.css";

// Import all images
import tomatoImg from './assets/tomato.jpg';
import potatoImg from './assets/potato.jpg';
import leafyVegiImg from './assets/leafyvegi.jpg';
import tractorImg from './assets/tractor.jpg';
import harvesterImg from './assets/harvester.jpg';
import plowImg from './assets/plow.jpg';
import organicFertilizerImg from './assets/organic.jpg';
import inorganicFertilizerImg from './assets/inorganic.jpg';

function FarmerProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'product',
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    duration: ''
  });

  useEffect(() => {
    const initializeData = async () => {
      await getCurrentUser();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchItems();
    }
  }, [currentUser]);

  const getCurrentUser = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    setCurrentUser(user);
    console.log('Current user loaded:', user);
  };

  const fetchItems = async () => {
    // Load items from localStorage for Firebase mode
    const savedItems = localStorage.getItem('userItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  };

  const getItemImage = (item) => {
    // For products
    if (item.type === 'product') {
      const itemName = item.name.toLowerCase();
      if (itemName.includes('tomato')) return tomatoImg;
      if (itemName.includes('potato')) return potatoImg;
      if (itemName.includes('spinach') || itemName.includes('cabbage') || itemName.includes('leafy')) return leafyVegiImg;
      
      switch(item.category) {
        case 'vegetable':
          return tomatoImg;
        case 'fruit':
          return potatoImg;
        case 'grain':
          return leafyVegiImg;
        default:
          return tomatoImg;
      }
    }
    // For tools
    else if (item.type === 'tool') {
      const itemName = item.name.toLowerCase();
      if (itemName.includes('tractor')) return tractorImg;
      if (itemName.includes('harvester')) return harvesterImg;
      if (itemName.includes('plow')) return plowImg;
      
      switch(item.category) {
        case 'tractor':
          return tractorImg;
        case 'harvester':
          return harvesterImg;
        case 'plow':
          return plowImg;
        case 'machinery':
          return tractorImg;
        default:
          return tractorImg;
      }
    }
    // For fertilizers
    else if (item.type === 'fertilizer') {
      switch(item.category) {
        case 'organic':
          return organicFertilizerImg;
        case 'chemical':
          return inorganicFertilizerImg;
        default:
          return organicFertilizerImg;
      }
    }
    return tomatoImg;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    const user = localStorage.getItem('user');
    if (!user) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    try {
      // Simulate adding item (since we're back to Firebase)
      const newItemWithId = {
        ...newItem,
        id: Date.now(), // Simple ID generation
        price: parseFloat(newItem.price),
        quantity: parseInt(newItem.quantity),
        farmer_id: JSON.parse(user).userId
      };
      
      // Add to current items
      setItems(prevItems => {
        const updatedItems = [...prevItems, newItemWithId];
        localStorage.setItem('userItems', JSON.stringify(updatedItems));
        return updatedItems;
      });
      
      // Show success popup
      alert('Your item has been added successfully!');
      
      // Reset form
      setNewItem({
        type: 'product',
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: '',
        duration: ''
      });
      
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      localStorage.setItem('userItems', JSON.stringify(updatedItems));
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item: ' + error.message);
    }
  };

  return (
    <div>
    <div className="back-button" onClick={() => navigate('/dashboardA')}>
    &larr; {t('backToDashboard')}
  </div>
  <button 
          className="update-profile-button"
          onClick={() => navigate('/profile')}
        >
          {t('updateProfile')}
        </button>
    <div className="farmer-profile-container">
     

      <h1>{t('myInventory')}</h1>
      <p className="subtitle">{t('manageProductsToolsFertilizers')}</p>

      <div className="product-management">
        {/* Add Item Form */}
        <div className="add-product-form">
          <h2>{t('addNewItem')}</h2>
          <div className="form-group">
            <label>{t('itemType')}</label>
            <select name="type" value={newItem.type} onChange={handleInputChange}>
              <option value="product">{t('product')}</option>
              <option value="tool">{t('tool')}</option>
              <option value="fertilizer">{t('fertilizer')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('itemName')}</label>
            <input 
              type="text" 
              name="name" 
              value={newItem.name} 
              onChange={handleInputChange} 
              placeholder={t('enterName')} 
            />
          </div>

          <div className="form-group">
            <label>{t('category')}</label>
            <select name="category" value={newItem.category} onChange={handleInputChange}>
              {newItem.type === 'product' ? (
                <>
                  <option value="">{t('selectCategory')}</option>
                  <option value="vegetable">{t('vegetable')}</option>
                  <option value="fruit">{t('fruit')}</option>
                  <option value="grain">{t('grain')}</option>
                </>
              ) : newItem.type === 'tool' ? (
                <>
                  <option value="">{t('selectTool')}</option>
                  <option value="tractor">{t('tractor')}</option>
                  <option value="harvester">{t('harvester')}</option>
                  <option value="plow">{t('plow')}</option>
                  <option value="machinery">{t('machinery')}</option>
                </>
              ) : (
                <>
                  <option value="">{t('selectFertilizerType')}</option>
                  <option value="organic">{t('organicFertilizer')}</option>
                  <option value="chemical">{t('chemicalFertilizer')}</option>
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>{t('price')}</label>
            <input 
              type="number" 
              name="price" 
              value={newItem.price} 
              onChange={handleInputChange} 
              placeholder={t('enterPrice')} 
            />
          </div>

          <div className="form-group">
            <label>{t('quantity')}</label>
            <input 
              type="number" 
              name="quantity" 
              value={newItem.quantity} 
              onChange={handleInputChange} 
              placeholder={t('enterQuantity')} 
            />
          </div>

          {newItem.type === 'tool' && (
            <div className="form-group">
              <label>{t('durationRentLease')}</label>
              <input 
                type="number" 
                name="duration" 
                value={newItem.duration} 
                onChange={handleInputChange} 
                placeholder={t('enterDuration')} 
              />
            </div>
          )}

          <div className="form-group">
            <label>{t('description')}</label>
            <textarea 
              name="description" 
              value={newItem.description} 
              onChange={handleInputChange} 
              placeholder={t('enterDetails')} 
            />
          </div>

          <button 
            className="add-button" 
            onClick={handleAddItem}
            disabled={loading}
          >
            {loading ? t('adding') : t('addItem')}
          </button>
        </div>

        {/* Display Items */}
        <div className="product-list">
          <h2>{t('inventory')} ({items.length})</h2>
          {items.length === 0 ? (
            <p className="no-products">{t('noItemsAdded')}</p>
          ) : (
            <div className="products-grid">
              {items.map(item => (
                <div className="product-card" key={item.id}>
                  <div className="product-image">
                    <img src={getItemImage(item)} alt={item.name} />
                  </div>
                  <div className="product-details">
                    <h3>{item.name}</h3>
                    <p className="category">{item.category} {item.type}</p>
                    <p className="price">₹{item.price}</p>
                    <p className="quantity">
                      {item.quantity} {item.type === 'product' ? t('kgAvailable') : t('unitsAvailable')}
                    </p>
                    {item.type === 'tool' && (
                      <p className="duration">{t('duration')}: {item.duration} {t('days')}</p>
                    )}
                    <p className="description">{item.description}</p>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default FarmerProfile;