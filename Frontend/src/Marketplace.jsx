import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./Marketplace.css";

// Import all images
import tomatoImg from './assets/tomato.jpg';
import potatoImg from './assets/potato.jpg';
import leafyVegiImg from './assets/leafyvegi.jpg';
import tractorImg from './assets/tractor.jpg';
import harvesterImg from './assets/harvester.jpg';
import plowImg from './assets/plow.jpg';
import organicFertilizerImg from './assets/organic.jpg';
import inorganicFertilizerImg from './assets/inorganic.jpg';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Function to get appropriate image based on product type and category
  const getProductImage = (product) => {
    // For products
    if (product.type === 'product') {
      switch(product.name.toLowerCase()) {
        case 'fresh tomatoes':
        case 'tomato':
          return tomatoImg;
        case 'potatoes':
        case 'potato':
          return potatoImg;
        case 'leafy vegetable':
        case 'spinach':
        case 'kale':
          return leafyVegiImg;
        default:
          switch(product.category) {
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
    }
    // For tools
    else if (product.type === 'tool') {
      switch(product.category) {
        case 'tractor':
        case 'machinery':
          return tractorImg;
        case 'harvester':
          return harvesterImg;
        case 'plow':
          return plowImg;
        default:
          return tractorImg;
      }
    }
    // For fertilizers
    else if (product.type === 'fertilizer') {
      switch(product.category) {
        case 'organic':
          return organicFertilizerImg;
        case 'chemical':
          return inorganicFertilizerImg;
        default:
          return organicFertilizerImg;
      }
    }
    return tomatoImg; // default image
  };

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        const response = await fetch('http://localhost:8001/products/');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceData();
  }, []);

  const handleTypeSelection = (type) => {
    setSelectedType(type);
  };

  const productTypes = [...new Set(products.map((product) => product.type))];

  return (
    <div className="marketplace-container">
      <h2>{t('marketplace')}</h2>

      {/* Full-Width Filter Buttons */}
      <div className="filter-buttons">
        <button onClick={() => handleTypeSelection("All")} className={selectedType === "All" ? "active" : ""}>
          {t('all')}
        </button>
        {productTypes.map((type) => (
          <button key={type} onClick={() => handleTypeSelection(type)} className={selectedType === type ? "active" : ""}>
            {t(type)}
          </button>
        ))}
      </div>

      {/* Full Page Product Grid */}
      <div className="product-grid">
        {loading ? (
          <p className="loading">{t('loadingProducts')}</p>
        ) : products.length > 0 ? (
          products
            .filter((product) => selectedType === "All" || product.type === selectedType)
            .map((product) => (
              <div key={product.id} className="product-card">
                {/* Product Image */}
                <div className="product-image-container">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="category">{t('category')}: {product.category}</p>
                  <p className="price">{t('price')}: ₹{product.price}</p>
                  <p>{t('quantity')}: {product.quantity}</p>
                  <p>{t('type')}: {product.type}</p>
                  <p>{t('description')}: {product.description}</p>
                  <p>{t('addedOn')}: {new Date(product.created_at).toLocaleString()}</p>
                  <p className="farmer-info">{t('farmerInfo')}: {product.farmer_id}</p>

                  {/* Buy Now Button */}
                  <button className="buy-now-btn" onClick={() => navigate(`/buy-now/${product.id}`)}>
                    {t('buyNow')}
                  </button>
                </div>
              </div>
            ))
        ) : (
          <p className="no-products">{t('noProductsAvailable')}</p>
        )}
      </div>
    </div>
  );
};

export default Marketplace;