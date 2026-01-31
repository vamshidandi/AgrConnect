import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PlantDiseases.css";
// Import images
import sample1 from './images/sample1.jpg';
import sample2 from './images/sample2.jpg';
import sample3 from './images/sample3.jpg';
import sample4 from './images/sample4.jpg';
import organicFertilizerImg from './assets/organic.jpg';
import inorganicFertilizerImg from './assets/inorganic.jpg';

function PlantDiseases() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fertilizers, setFertilizers] = useState([]);
  const [isFetchingFertilizers, setIsFetchingFertilizers] = useState(false);

  const sampleImages = [
    { src: sample1, label: "Tomato Leaf" },
    { src: sample2, label: "Corn Plant" },
    { src: sample3, label: "Potato Leaf" },
    { src: sample4, label: "Potato Leaf" },
  ];

  // Function to get fertilizer image based on category
  const getFertilizerImage = (category) => {
    switch(category) {
      case 'organic':
        return organicFertilizerImg;
      case 'chemical':
        return inorganicFertilizerImg;
      default:
        return organicFertilizerImg;
    }
  };

  // Fetch fertilizers from backend
  const fetchFertilizers = async (plantType = null) => {
    setIsFetchingFertilizers(true);
    try {
      // Skip fetching fertilizers for now - will be set from prediction response
      setFertilizers([]);
    } catch (error) {
      console.error("Error fetching fertilizers:", error);
    } finally {
      setIsFetchingFertilizers(false);
    }
  };

  useEffect(() => {
    // Load all fertilizers initially
    fetchFertilizers();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file); // Store the actual file object
      setPrediction(null);
    }
  };

  const handleSampleImageClick = async (imageSrc) => {
    try {
      // Convert sample image to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      setSelectedImage(blob);
      setPrediction(null);
    } catch (error) {
      console.error('Error loading sample image:', error);
    }
  };

  const handleDetectDisease = async () => {
    if (!selectedImage) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      
      // Append the file directly (whether it's from upload or sample)
      if (selectedImage instanceof File || selectedImage instanceof Blob) {
        formData.append("file", selectedImage, "image.jpg");
      } else {
        throw new Error("Invalid image format");
      }

      console.log('Sending request to:', "http://localhost:8001/predict/");
      
      const response = await fetch("http://localhost:8001/predict/", {
        method: "POST",
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Prediction result:', data);
      setPrediction(data);
      
      // Set pesticides from backend response
      if (data.recommended_pesticides) {
        setFertilizers(data.recommended_pesticides);
      }
    } catch (error) {
      console.error('Disease detection error:', error);
      setPrediction({
        error: "Error analyzing image. Please check if the backend server is running."
      });
    }

    setIsLoading(false);
  };



  const handleChangeImage = () => {
    setSelectedImage(null);
    setPrediction(null);
  };

  return (
    <div className="plant-diseases-container">
      <div className="header-section">
        <button className="back-button" onClick={() => navigate("/dashboardA")}>
          <span>&larr;</span> Back to Dashboard
        </button>
        
        <div className="title-section">
          <h1>Plant Disease Detection</h1>
          <p className="subtitle">Upload an image of your plant to detect potential diseases</p>
        </div>
        
        <div style={{ width: "100px" }}></div>
      </div>

      <div className="content-grid">
        <div className="upload-section">
          <h2 className="section-title">Upload Plant Image</h2>
          
          {selectedImage ? (
            <div className="image-preview">
              <img 
                src={selectedImage instanceof File || selectedImage instanceof Blob 
                  ? URL.createObjectURL(selectedImage) 
                  : selectedImage
                } 
                alt="Uploaded plant" 
              />
              <button className="change-image" onClick={handleChangeImage}>
                Change Image
              </button>
            </div>
          ) : (
            <label className="upload-box">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: "none" }} 
              />
              <div className="upload-content">
                <span className="upload-icon">+</span>
                <p>Click to upload plant image</p>
                <p className="hint">(JPG, PNG, max 5MB)</p>
              </div>
            </label>
          )}
          
          <div className="sample-images-section">
            <h3 className="section-title">Sample Images</h3>
            <p className="text-center">Upload in this format</p>
            <div className="sample-cards">
              {sampleImages.map((image, index) => (
                <div 
                  key={index} 
                  className="sample-card"
                  onClick={() => handleSampleImageClick(image.src)}
                >
                  <img src={image.src} alt={image.label} />
                  <div className="sample-card-label">{image.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="results-section">
          <div className="results-header">
            <h2 className="section-title">Detection Results</h2>
            <button 
              className="detect-button" 
              onClick={handleDetectDisease}
              disabled={!selectedImage || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyzing...
                </>
              ) : (
                "Detect Disease"
              )}
            </button>
          </div>

          {prediction && (
            <div className="prediction-result">
              {prediction.error ? (
                <div className="error-message">{prediction.error}</div>
              ) : (
                <>
                  <h3>Analysis Result:</h3>
                  <div className={`result-box ${prediction.is_healthy ? "healthy" : "diseased"}`}>
                    <h4>{prediction.plant} ({prediction.scientific_name})</h4>
                    <p><strong>Condition:</strong> {prediction.disease}</p>
                    <p><strong>Confidence:</strong> {prediction.confidence}%</p>
                  </div>

                  <div className="disease-details">
                    <h4>Disease Information</h4>
                    <p>{prediction.disease_info}</p>
                    
                    <h4>Recommended Treatment</h4>
                    <div className="remedy-list">
                      {prediction.treatment.split('\n').map((item, i) => (
                        <p key={i}>{item}</p>
                      ))}
                    </div>
                    
                    <h4>Prevention Tips</h4>
                    <p>{prediction.prevention}</p>
                  </div>

                  {/* Recommended Pesticides Section */}
                  <div className="fertilizers-section">
                    <h3>Recommended Pesticides & Treatments</h3>
                    
                    {isFetchingFertilizers ? (
                      <p className="loading">Loading fertilizers...</p>
                    ) : fertilizers.length > 0 ? (
                      <div className="fertilizers-grid">
                        {fertilizers.map((pesticide, index) => (
                          <div key={index} className="fertilizer-card">
                            <div className="fertilizer-image-container">
                              <img 
                                src={getFertilizerImage('chemical')} 
                                alt={pesticide.name}
                                className="fertilizer-image"
                              />
                            </div>
                            <div className="fertilizer-details">
                              <h4>{pesticide.name}</h4>
                              <p className="category">Type: {pesticide.type}</p>
                              <p className="price">Price: ₹{pesticide.price}</p>
                              <p>Active Ingredient: {pesticide.active_ingredient}</p>
                              <p>Application Rate: {pesticide.application_rate}</p>
                              <p>Description: {pesticide.description}</p>
                              <button 
                                className="buy-now-btn"
                                onClick={() => alert('Contact local dealer for purchase')}
                              >
                                Get Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-fertilizers">No pesticide recommendations available.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlantDiseases;