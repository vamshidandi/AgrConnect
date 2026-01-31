from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
import cv2
import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import sqlite3
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agri-AI Backend", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Database setup
DATABASE_PATH = "agri_ai.db"

def init_database():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            description TEXT,
            farmer_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Pesticides table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pesticides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            target_disease TEXT NOT NULL,
            target_plant TEXT,
            active_ingredient TEXT,
            application_rate TEXT,
            price REAL,
            description TEXT
        )
    ''')
    
    # Disease information table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS diseases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_name TEXT NOT NULL,
            disease_name TEXT NOT NULL,
            symptoms TEXT,
            treatment TEXT,
            prevention TEXT,
            severity TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

# Load AI Model
model = None
try:
    model = hub.load("https://www.kaggle.com/models/rishitdagli/plant-disease/TensorFlow2/plant-disease/1")
    logger.info("AI Model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load AI model: {e}")

# Plant disease class mappings
CLASS_INDICES = {
    "0": {"plant": "Apple", "disease": "Apple_scab"},
    "1": {"plant": "Apple", "disease": "Black_rot"},
    "2": {"plant": "Apple", "disease": "Cedar_apple_rust"},
    "3": {"plant": "Apple", "disease": "healthy"},
    "4": {"plant": "Tomato", "disease": "Bacterial_spot"},
    "5": {"plant": "Tomato", "disease": "Early_blight"},
    "6": {"plant": "Tomato", "disease": "Late_blight"},
    "7": {"plant": "Tomato", "disease": "healthy"},
    "8": {"plant": "Potato", "disease": "Early_blight"},
    "9": {"plant": "Potato", "disease": "Late_blight"},
    "10": {"plant": "Potato", "disease": "healthy"},
}

# Pydantic models
class ProductCreate(BaseModel):
    name: str
    type: str
    category: str
    price: float
    quantity: int
    description: Optional[str] = None
    farmer_id: Optional[str] = None

class PesticideRecommendation(BaseModel):
    name: str
    type: str
    active_ingredient: str
    application_rate: str
    price: float
    description: str

# Database helper functions
def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Preprocess image for AI model prediction"""
    try:
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        # Decode image
        img_array = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Preprocess for model
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (224, 224))
        img = img.astype(np.float32) / 255.0
        return np.expand_dims(img, axis=0)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

def get_pesticide_recommendations(plant: str, disease: str) -> List[Dict]:
    """Get pesticide recommendations for detected disease"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Query pesticides for specific plant and disease
    cursor.execute('''
        SELECT * FROM pesticides 
        WHERE target_plant = ? OR target_disease = ?
        ORDER BY price ASC
    ''', (plant.lower(), disease.lower()))
    
    pesticides = cursor.fetchall()
    conn.close()
    
    if not pesticides:
        # Return default recommendations if no specific ones found
        return get_default_pesticides(disease)
    
    return [dict(pesticide) for pesticide in pesticides]

def get_default_pesticides(disease: str) -> List[Dict]:
    """Return default pesticide recommendations"""
    default_pesticides = {
        "bacterial_spot": [
            {
                "name": "Copper Hydroxide",
                "type": "Bactericide",
                "active_ingredient": "Copper Hydroxide 53.8%",
                "application_rate": "2-3 grams per liter",
                "price": 250.0,
                "description": "Effective against bacterial diseases"
            }
        ],
        "early_blight": [
            {
                "name": "Mancozeb",
                "type": "Fungicide",
                "active_ingredient": "Mancozeb 75%",
                "application_rate": "2 grams per liter",
                "price": 180.0,
                "description": "Broad spectrum fungicide for blight control"
            }
        ],
        "late_blight": [
            {
                "name": "Metalaxyl + Mancozeb",
                "type": "Fungicide",
                "active_ingredient": "Metalaxyl 8% + Mancozeb 64%",
                "application_rate": "2.5 grams per liter",
                "price": 320.0,
                "description": "Systemic and contact fungicide"
            }
        ]
    }
    
    disease_key = disease.lower().replace(" ", "_")
    return default_pesticides.get(disease_key, [])

# API Endpoints

@app.get("/")
async def root():
    return {"message": "Agri-AI Backend API", "status": "running"}

@app.post("/predict/")
async def predict_disease(file: UploadFile = File(...)):
    """Predict plant disease from uploaded image"""
    if model is None:
        raise HTTPException(status_code=503, detail="AI model not available")
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
    
    try:
        image_bytes = await file.read()
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        predictions = model(processed_image)
        predicted_index = str(np.argmax(predictions))
        confidence = float(np.max(predictions)) * 100
        
        if predicted_index not in CLASS_INDICES:
            raise HTTPException(status_code=500, detail="Invalid prediction result")
        
        prediction = CLASS_INDICES[predicted_index]
        plant = prediction["plant"]
        disease = prediction["disease"]
        
        # Get pesticide recommendations
        pesticides = get_pesticide_recommendations(plant, disease)
        
        # Get disease information
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM diseases 
            WHERE plant_name = ? AND disease_name = ?
        ''', (plant.lower(), disease.lower()))
        
        disease_info = cursor.fetchone()
        conn.close()
        
        # Default disease info if not in database
        if not disease_info:
            disease_info = {
                "symptoms": f"Symptoms of {disease} in {plant}",
                "treatment": "Apply recommended pesticides and follow good agricultural practices",
                "prevention": "Maintain proper plant spacing and avoid overhead watering"
            }
        else:
            disease_info = dict(disease_info)
        
        return {
            "plant": plant,
            "disease": disease,
            "confidence": round(confidence, 2),
            "is_healthy": disease == "healthy",
            "disease_info": disease_info.get("symptoms", ""),
            "treatment": disease_info.get("treatment", ""),
            "prevention": disease_info.get("prevention", ""),
            "recommended_pesticides": pesticides
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/products/")
async def get_products(product_type: Optional[str] = None):
    """Get all products or filter by type"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if product_type:
        cursor.execute("SELECT * FROM products WHERE type = ?", (product_type,))
    else:
        cursor.execute("SELECT * FROM products")
    
    products = cursor.fetchall()
    conn.close()
    
    return [dict(product) for product in products]

@app.post("/products/")
async def create_product(product: ProductCreate):
    """Create a new product"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO products (name, type, category, price, quantity, description, farmer_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (product.name, product.type, product.category, product.price, 
          product.quantity, product.description, product.farmer_id))
    
    product_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"id": product_id, "message": "Product created successfully"}

@app.get("/products/{product_id}")
async def get_product(product_id: int):
    """Get specific product by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    product = cursor.fetchone()
    conn.close()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return dict(product)

@app.get("/pesticides/")
async def get_pesticides(plant: Optional[str] = None, disease: Optional[str] = None):
    """Get pesticide recommendations"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if plant and disease:
        cursor.execute('''
            SELECT * FROM pesticides 
            WHERE target_plant = ? OR target_disease = ?
        ''', (plant.lower(), disease.lower()))
    else:
        cursor.execute("SELECT * FROM pesticides")
    
    pesticides = cursor.fetchall()
    conn.close()
    
    return [dict(pesticide) for pesticide in pesticides]

@app.post("/seed-data/")
async def seed_database():
    """Seed database with sample data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Sample products
    sample_products = [
        ("Tomato", "product", "vegetable", 50.0, 100, "Fresh organic tomatoes", "farmer1"),
        ("Potato", "product", "vegetable", 30.0, 200, "High quality potatoes", "farmer1"),
        ("Tractor", "tool", "machinery", 500000.0, 1, "John Deere tractor for rent", "farmer2"),
        ("Organic Fertilizer", "fertilizer", "organic", 25.0, 50, "NPK organic fertilizer", "farmer3"),
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO products (name, type, category, price, quantity, description, farmer_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', sample_products)
    
    # Sample pesticides
    sample_pesticides = [
        ("Copper Hydroxide", "Bactericide", "bacterial_spot", "tomato", "Copper Hydroxide 53.8%", "2-3g/L", 250.0, "Effective against bacterial diseases"),
        ("Mancozeb", "Fungicide", "early_blight", "tomato", "Mancozeb 75%", "2g/L", 180.0, "Broad spectrum fungicide"),
        ("Metalaxyl + Mancozeb", "Fungicide", "late_blight", "potato", "Metalaxyl 8% + Mancozeb 64%", "2.5g/L", 320.0, "Systemic fungicide"),
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO pesticides (name, type, target_disease, target_plant, active_ingredient, application_rate, price, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', sample_pesticides)
    
    # Sample disease information
    sample_diseases = [
        ("tomato", "bacterial_spot", "Small dark spots on leaves", "Apply copper-based bactericides", "Avoid overhead watering", "medium"),
        ("tomato", "early_blight", "Brown spots with concentric rings", "Apply fungicides regularly", "Ensure good air circulation", "high"),
        ("potato", "late_blight", "Dark lesions on leaves", "Apply systemic fungicides", "Plant resistant varieties", "high"),
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO diseases (plant_name, disease_name, symptoms, treatment, prevention, severity)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', sample_diseases)
    
    conn.commit()
    conn.close()
    
    return {"message": "Database seeded successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)