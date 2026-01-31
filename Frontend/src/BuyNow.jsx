import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BuyNow.css';

function BuyNow() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:8001/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    
    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setPaymentLoading(false);
      return;
    }

    const totalAmount = product.price * quantity;

    const options = {
      key: 'rzp_test_9WaeLLXtGwlkMq', // Replace with your Razorpay key
      amount: totalAmount * 100, // Amount in paise
      currency: 'INR',
      name: 'Agri Connect',
      description: `Purchase of ${product.name}`,
      image: '/logo.png',
      handler: function (response) {
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        navigate('/marketplace');
      },
      prefill: {
        name: 'Customer',
        email: 'customer@example.com',
        contact: '9999999999'
      },
      notes: {
        product_id: productId,
        quantity: quantity
      },
      theme: {
        color: '#2ecc71'
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    setPaymentLoading(false);
  };

  if (loading) {
    return (
      <div className="buynow-container">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="buynow-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/marketplace')} className="back-btn">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="buynow-container">
      <div className="buynow-header">
        <button onClick={() => navigate('/marketplace')} className="back-btn">
          ← Back to Marketplace
        </button>
        <h1>Purchase Product</h1>
      </div>

      <div className="product-details">
        <div className="product-info">
          <h2>{product.name}</h2>
          <p className="category">Category: {product.category}</p>
          <p className="price">Price: ₹{product.price} per unit</p>
          <p className="description">{product.description}</p>
          <p className="stock">Available Stock: {product.quantity} units</p>
        </div>

        <div className="purchase-section">
          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={product.quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="total-section">
            <h3>Total Amount: ₹{(product.price * quantity).toFixed(2)}</h3>
          </div>

          <button
            className="pay-now-btn"
            onClick={handlePayment}
            disabled={paymentLoading || quantity > product.quantity}
          >
            {paymentLoading ? 'Processing...' : 'Pay Now with Razorpay'}
          </button>

          {quantity > product.quantity && (
            <p className="error-text">Quantity exceeds available stock</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuyNow;