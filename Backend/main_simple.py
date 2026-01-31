from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import sqlite3
from datetime import datetime
import logging
import random

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
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

# Mock disease detection data
MOCK_DISEASES = [
    {
        "plant": "Tomato",
        "disease": "Early_blight",
        "symptoms": "Brown spots with concentric rings on leaves",
        "treatment": "Apply fungicides containing chlorothalonil or mancozeb",
        "prevention": "Ensure proper plant spacing and avoid overhead watering"
    },
    {
        "plant": "Potato", 
        "disease": "Late_blight",
        "symptoms": "Dark water-soaked lesions on leaves and stems",
        "treatment": "Apply systemic fungicides like metalaxyl",
        "prevention": "Plant resistant varieties and ensure good drainage"
    },
    {
        "plant": "Apple",
        "disease": "Apple_scab", 
        "symptoms": "Olive-green to black spots on leaves and fruit",
        "treatment": "Apply fungicides during wet weather periods",
        "prevention": "Remove fallen leaves and improve air circulation"
    }
]

# Pydantic models
class ProductCreate(BaseModel):
    name: str
    type: str
    category: str
    price: float
    quantity: int
    description: Optional[str] = None
    farmer_id: Optional[str] = None

# Database helper functions
def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_pesticide_recommendations(plant: str, disease: str) -> List[Dict]:
    """Get pesticide recommendations for detected disease"""
    # Mock pesticide data based on disease
    pesticide_db = {
        "early_blight": [
            {
                "name": "Mancozeb 75% WP",
                "type": "Fungicide",
                "active_ingredient": "Mancozeb 75%",
                "application_rate": "2-2.5 grams per liter",
                "price": 180.0,
                "description": "Broad spectrum contact fungicide effective against early blight"
            },
            {
                "name": "Chlorothalonil 75% WP",
                "type": "Fungicide", 
                "active_ingredient": "Chlorothalonil 75%",
                "application_rate": "2 grams per liter",
                "price": 220.0,
                "description": "Protective fungicide for blight control"
            }
        ],
        "late_blight": [
            {
                "name": "Metalaxyl + Mancozeb",
                "type": "Systemic Fungicide",
                "active_ingredient": "Metalaxyl 8% + Mancozeb 64%", 
                "application_rate": "2.5 grams per liter",
                "price": 320.0,
                "description": "Systemic and contact fungicide for late blight"
            }
        ],
        "apple_scab": [
            {
                "name": "Myclobutanil 10% WP",
                "type": "Systemic Fungicide",
                "active_ingredient": "Myclobutanil 10%",
                "application_rate": "1 gram per liter", 
                "price": 280.0,
                "description": "Systemic fungicide for apple scab control"
            }
        ]
    }
    
    disease_key = disease.lower().replace(" ", "_")
    return pesticide_db.get(disease_key, [])

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Agri-AI Backend API", "status": "running", "version": "1.0.0"}

@app.post("/predict/")
async def predict_disease(file: UploadFile = File(...)):
    """Mock plant disease prediction from uploaded image"""
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
    
    try:
        # Read and validate image
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        # Mock prediction - randomly select a disease
        mock_result = random.choice(MOCK_DISEASES)
        confidence = round(random.uniform(75, 95), 2)
        
        # Get pesticide recommendations
        pesticides = get_pesticide_recommendations(mock_result["plant"], mock_result["disease"])
        
        return {
            "plant": mock_result["plant"],
            "disease": mock_result["disease"], 
            "confidence": confidence,
            "is_healthy": mock_result["disease"] == "healthy",
            "disease_info": mock_result["symptoms"],
            "treatment": mock_result["treatment"],
            "prevention": mock_result["prevention"],
            "recommended_pesticides": pesticides,
            "scientific_name": f"{mock_result['plant']} species"
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

@app.post("/seed-data/")
async def seed_database():
    """Seed database with sample data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Sample products
    sample_products = [
        ("Fresh Tomatoes", "product", "vegetable", 50.0, 100, "Organic red tomatoes", "farmer1"),
        ("Potatoes", "product", "vegetable", 30.0, 200, "High quality potatoes", "farmer1"), 
        ("John Deere Tractor", "tool", "machinery", 500000.0, 1, "Heavy duty tractor for farming", "farmer2"),
        ("NPK Fertilizer", "fertilizer", "chemical", 25.0, 50, "Balanced NPK fertilizer", "farmer3"),
        ("Organic Compost", "fertilizer", "organic", 15.0, 100, "Rich organic compost", "farmer3"),
        ("Harvester Machine", "tool", "machinery", 800000.0, 1, "Combine harvester for crops", "farmer2"),
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO products (name, type, category, price, quantity, description, farmer_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', sample_products)
    
    conn.commit()
    conn.close()
    
    return {"message": "Database seeded with sample products successfully"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)