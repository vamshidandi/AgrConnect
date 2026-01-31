import React, { useState } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import './CropRotation.css';

const CropRotationPlanner = () => {
  const [formData, setFormData] = useState({
    soilType: 'loamy',
    previousCrops: 'corn'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const soilEmojis = {
    loamy: '🌱',
    sandy: '🏖️',
    clay: '🧱',
    silty: '💧'
  };

  const getRecommendations = (soilType, previousCrops) => {
    const recommendations = {
      loamy: [
        { name: "Tomatoes", reason: "Thrive in well-balanced loamy soil", emoji: "🍅" },
        { name: "Carrots", reason: "Develop straight roots in loose loam", emoji: "🥕" },
        { name: "Lettuce", reason: "Grows quickly in fertile loam", emoji: "🥬" },
        { name: "Beans", reason: "Fix nitrogen in loamy soil", emoji: "🫘" }
      ],
      sandy: [
        { name: "Carrots", reason: "Roots develop well in loose sand", emoji: "🥕" },
        { name: "Radishes", reason: "Quick-growing in warm sandy soils", emoji: "🌶️" },
        { name: "Potatoes", reason: "Tuber development in well-drained sand", emoji: "🥔" },
        { name: "Asparagus", reason: "Performs well in sandy conditions", emoji: "🌱" }
      ],
      clay: [
        { name: "Cabbage", reason: "Handles heavy clay soils well", emoji: "🥬" },
        { name: "Brussels Sprouts", reason: "Anchors well in clay", emoji: "🥦" },
        { name: "Kale", reason: "Tolerates dense clay soil", emoji: "🥬" },
        { name: "Broccoli", reason: "Grows well in moisture-retentive clay", emoji: "🥦" }
      ],
      silty: [
        { name: "Spinach", reason: "Loves moisture-retentive silt", emoji: "🍃" },
        { name: "Onions", reason: "Bulbs develop well in silty soil", emoji: "🧅" },
        { name: "Peas", reason: "Early crop for fertile silt", emoji: "🫛" },
        { name: "Strawberries", reason: "Thrive in rich silty loam", emoji: "🍓" }
      ]
    };

    const avoidedCrops = {
      loamy: ["Watermelon", "Pumpkin"],
      sandy: ["Celery", "Cauliflower"],
      clay: ["Carrots", "Parsnips"],
      silty: ["Sweet Potatoes", "Artichokes"]
    };

    return {
      soilType,
      recommended: recommendations[soilType],
      avoided: [...previousCrops.split(','), ...avoidedCrops[soilType]]
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      try {
        setResult(getRecommendations(formData.soilType, formData.previousCrops));
      } catch (err) {
        setError("Failed to generate rotation plan. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="crop-rotation-page">
      <div className="crop-rotation-container">
        <div className="planner-card">
          <h1 className="main-title">🌾 Crop Rotation Planner 🌾</h1>
          <h2 className="section-title">🧑‍🌾 Smart Crop Rotation Planner</h2>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="input-label">🌱 Soil Type *</Form.Label>
              <Form.Select
                value={formData.soilType}
                onChange={(e) => setFormData({...formData, soilType: e.target.value})}
                className="form-input"
                required
              >
                <option value="loamy">🌱 Loamy (Best all-around)</option>
                <option value="sandy">🏖️ Sandy (Fast-draining)</option>
                <option value="clay">🧱 Clay (Heavy and dense)</option>
                <option value="silty">💧 Silty (Moisture-retentive)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="input-label">🌽 Previous Crops *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.previousCrops}
                onChange={(e) => setFormData({...formData, previousCrops: e.target.value})}
                className="form-input"
                required
                placeholder="e.g., 🌽 corn, 🌾 wheat, 🍅 tomatoes"
              />
              <Form.Text className="input-hint">✏️ Separate crops with commas</Form.Text>
            </Form.Group>

            <div className="divider">✨✨✨</div>

            <div className="text-center">
              <Button 
                variant="success" 
                type="submit" 
                className="submit-btn glow-on-hover"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    🌱 Generating Plan...
                  </>
                ) : (
                  '🔄 Generate Rotation Plan'
                )}
              </Button>
            </div>
          </Form>

          {error && (
            <Alert variant="danger" className="mt-4 glow-alert">
              ⚠️ {error}
            </Alert>
          )}

          {result && (
            <div className="results-section animate-fade">
              <h2 className="section-title">
                {soilEmojis[result.soilType]} Rotation Plan for {result.soilType} Soil
              </h2>
              
              <div className="recommended-section">
                <h3 className="subsection-title">
                  ✅ Recommended Crops ({result.recommended.length})
                </h3>
                <ul className="crop-list">
                  {result.recommended.map((crop, index) => (
                    <li key={index} className="crop-item glow-item">
                      <strong>{crop.emoji} {crop.name}</strong>
                      <p className="crop-reason">- {crop.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="avoided-section">
                <h3 className="subsection-title">
                  ❌ Crops to Avoid ({result.avoided.length})
                </h3>
                <div className="avoided-crops">
                  {result.avoided.map((crop, index) => (
                    <span key={index} className="avoided-crop glow-badge">
                      {crop.trim() === 'corn' ? '🌽' : 
                       crop.trim() === 'wheat' ? '🌾' : 
                       crop.trim() === 'tomatoes' ? '🍅' :
                       crop.trim() === 'watermelon' ? '🍉' :
                       crop.trim() === 'pumpkin' ? '🎃' :
                       crop.trim() === 'celery' ? '🥬' :
                       crop.trim() === 'cauliflower' ? '🥦' :
                       crop.trim() === 'carrots' ? '🥕' :
                       crop.trim() === 'parsnips' ? '🥕' :
                       crop.trim() === 'sweet potatoes' ? '🍠' :
                       crop.trim() === 'artichokes' ? '🌵' : '🌱'} {crop.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="expert-tips">
                <h3 className="subsection-title">💡 Expert Tips for {result.soilType} Soil</h3>
                <ul className="tips-list">
                  {result.soilType === 'loamy' && (
                    <>
                      <li>🔄 Rotate between heavy feeders (tomatoes), light feeders (onions), and soil builders (beans)</li>
                      <li>🌱 Follow nitrogen-loving crops with nitrogen-fixing legumes</li>
                      <li>🍃 Use cover crops like clover in off-seasons</li>
                    </>
                  )}
                  {result.soilType === 'sandy' && (
                    <>
                      <li>💧 Water more frequently as sandy soil drains quickly</li>
                      <li>🌿 Add organic matter annually to improve water retention</li>
                      <li>🔄 Rotate deep-rooted crops with shallow-rooted ones</li>
                    </>
                  )}
                  {result.soilType === 'clay' && (
                    <>
                      <li>🪴 Add compost to improve drainage in heavy clay</li>
                      <li>🔄 Rotate crops that break up soil (daikon radish) with leafy greens</li>
                      <li>⏳ Plant later in spring as clay warms slowly</li>
                    </>
                  )}
                  {result.soilType === 'silty' && (
                    <>
                      <li>🚫 Avoid compaction by not working soil when wet</li>
                      <li>🔄 Rotate between root crops and leafy vegetables</li>
                      <li>🌾 Take advantage of silty soil's fertility for quick-growing crops</li>
                    </>
                  )}
                  <li>📅 Keep records of your planting history for better rotation planning</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropRotationPlanner;