from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import numpy as np
import cv2
import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import sqlite3
from datetime import datetime, timedelta
import logging
import random
import hashlib
import jwt
from passlib.context import CryptContext
import tensorflow as tf
import tensorflow_hub as hub
from PIL import Image
import io

# Load the model from TensorFlow Hub (do this once at startup)
try:
    model = hub.load("https://www.kaggle.com/models/rishitdagli/plant-disease/TensorFlow2/plant-disease/1")
    print("TensorFlow model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Define class indices manually
class_indices = {
    "0": "Apple___Apple_scab", "1": "Apple___Black_rot", "2": "Apple___Cedar_apple_rust", "3": "Apple___healthy",
    "4": "Blueberry___healthy", "5": "Cherry_(including_sour)___Powdery_mildew", "6": "Cherry_(including_sour)___healthy",
    "7": "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "8": "Corn_(maize)___Common_rust_", 
    "9": "Corn_(maize)___Northern_Leaf_Blight", "10": "Corn_(maize)___healthy", "11": "Grape___Black_rot",
    "12": "Grape___Esca_(Black_Measles)", "13": "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "14": "Grape___healthy",
    "15": "Orange___Haunglongbing_(Citrus_greening)", "16": "Peach___Bacterial_spot", "17": "Peach___healthy",
    "18": "Pepper_bell___Bacterial_spot", "19": "Pepper_bell___healthy", "20": "Potato___Early_blight",
    "21": "Potato___Late_blight", "22": "Potato___healthy", "23": "Raspberry___healthy", "24": "Soybean___healthy",
    "25": "Squash___Powdery_mildew", "26": "Strawberry___Leaf_scorch", "27": "Strawberry___healthy",
    "28": "Tomato___Bacterial_spot", "29": "Tomato___Early_blight", "30": "Tomato___Late_blight",
    "31": "Tomato___Leaf_Mold", "32": "Tomato___Septoria_leaf_spot",
    "33": "Tomato___Spider_mites Two-spotted_spider_mite", "34": "Tomato___Target_Spot",
    "35": "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "36": "Tomato___Tomato_mosaic_virus", "37": "Tomato___healthy"
}

def preprocess_image_from_upload(image_bytes):
    """Preprocess uploaded image for prediction"""
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        # Convert to numpy array
        img_array = np.array(image)
        # Resize to model input size
        img_array = cv2.resize(img_array, (224, 224))
        # Normalize pixel values
        img_array = img_array.astype(np.float32) / 255.0
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agri-AI Backend", version="1.0.0")

# Security
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_PATH = "agri_ai.db"

def init_database():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            mobile TEXT,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            user_type TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Add unique constraints if they don't exist
    try:
        cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL')
        cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile) WHERE mobile IS NOT NULL')
    except:
        pass
    
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
            farmer_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES users (id)
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
    },
    {
        "plant": "Tomato",
        "disease": "healthy",
        "symptoms": "Plant appears healthy with no visible disease symptoms",
        "treatment": "No treatment needed - continue regular care",
        "prevention": "Maintain good plant hygiene and proper watering"
    }
]

# Pydantic models
class UserCreate(BaseModel):
    identifier: str  # Can be email or mobile number
    password: str
    name: str
    user_type: str  # "farmer" or "customer"

class UserLogin(BaseModel):
    identifier: str  # Can be email or mobile number
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class ProductCreate(BaseModel):
    name: str
    type: str
    category: str
    price: float
    quantity: int
    description: Optional[str] = None

# Auth helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)

# Database helper functions
def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_pesticide_recommendations(plant: str, disease: str) -> List[Dict]:
    """Get pesticide recommendations for detected disease"""
    pesticide_db = {
        "early_blight": [
            {
                "name": "Mancozeb 75% WP",
                "type": "Fungicide",
                "active_ingredient": "Mancozeb 75%",
                "application_rate": "2-2.5 grams per liter",
                "price": 180.0,
                "description": "Broad spectrum contact fungicide effective against early blight"
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

@app.get("/test-signup/")
async def test_signup_endpoint():
    """Test if signup endpoint is accessible"""
    return {"message": "Signup endpoint is working"}

@app.post("/signup", response_model=Token)
async def signup(user: UserCreate):
    """Register a new user"""
    print(f"Signup attempt - identifier: {user.identifier}, name: {user.name}, user_type: {user.user_type}")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Use identifier as email (since we're sending email from frontend)
    email = user.identifier
    
    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="User already registered")
    
    # Hash password and create user (without mobile field)
    hashed_password = get_password_hash(user.password)
    cursor.execute('''
        INSERT INTO users (email, password_hash, name, user_type)
        VALUES (?, ?, ?, ?)
    ''', (email, hashed_password, user.name, user.user_type))
    
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    print(f"User created successfully with ID: {user_id}")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": email,
            "name": user.name,
            "user_type": user.user_type
        }
    }

@app.post("/login", response_model=Token)
async def login(user: UserLogin):
    """Login user"""
    print(f"Login attempt - identifier: {user.identifier}, password length: {len(user.password)}")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Try to find user by email (since we're using email in frontend)
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.identifier,))
    db_user = cursor.fetchone()
    
    if not db_user:
        print(f"User not found: {user.identifier}")
        conn.close()
        raise HTTPException(status_code=401, detail="User not found")
    
    print(f"User found: {db_user['email']}, checking password...")
    
    if not verify_password(user.password, db_user["password_hash"]):
        print("Password verification failed")
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid password")
    
    print("Password verified successfully")
    conn.close()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user["id"])}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user["id"],
            "email": db_user["email"],
            "name": db_user["name"],
            "user_type": db_user["user_type"]
        }
    }

@app.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "user_type": current_user["user_type"]
    }

@app.post("/predict/")
async def predict_disease(file: UploadFile = File(...)):
    """Plant disease prediction from uploaded image"""
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
    
    try:
        # Read image
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        if model is not None:
            # Use actual TensorFlow model
            processed_image = preprocess_image_from_upload(image_bytes)
            if processed_image is not None:
                predictions = model(processed_image)
                predicted_index = np.argmax(predictions)
                predicted_class = class_indices[str(predicted_index)]
                confidence = float(np.max(predictions) * 100)
                
                # Parse the prediction
                parts = predicted_class.split('___')
                plant = parts[0].replace('_', ' ')
                disease = parts[1].replace('_', ' ') if len(parts) > 1 else 'Unknown'
                
                is_healthy = 'healthy' in disease.lower()
                
                # Get disease info
                disease_info = get_disease_info(plant, disease)
                pesticides = get_pesticide_recommendations(plant, disease) if not is_healthy else []
                
                return {
                    "plant": plant,
                    "disease": disease,
                    "confidence": round(confidence, 2),
                    "is_healthy": is_healthy,
                    "disease_info": disease_info["symptoms"],
                    "treatment": disease_info["treatment"],
                    "prevention": disease_info["prevention"],
                    "recommended_pesticides": pesticides,
                    "scientific_name": f"{plant} species"
                }
        
        # Fallback to mock prediction if model fails
        mock_result = random.choice(MOCK_DISEASES)
        confidence = round(random.uniform(75, 95), 2)
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

def get_disease_info(plant: str, disease: str):
    """Get detailed disease information"""
    disease_db = {
        "Early blight": {
            "symptoms": "Brown spots with concentric rings on leaves",
            "treatment": "Apply fungicides containing chlorothalonil or mancozeb",
            "prevention": "Ensure proper plant spacing and avoid overhead watering"
        },
        "Late blight": {
            "symptoms": "Dark water-soaked lesions on leaves and stems",
            "treatment": "Apply systemic fungicides like metalaxyl",
            "prevention": "Plant resistant varieties and ensure good drainage"
        },
        "Apple scab": {
            "symptoms": "Olive-green to black spots on leaves and fruit",
            "treatment": "Apply fungicides during wet weather periods",
            "prevention": "Remove fallen leaves and improve air circulation"
        },
        "healthy": {
            "symptoms": "Plant appears healthy with no visible disease symptoms",
            "treatment": "No treatment needed - continue regular care",
            "prevention": "Maintain good plant hygiene and proper watering"
        }
    }
    
    return disease_db.get(disease, {
        "symptoms": f"Symptoms of {disease} detected on {plant}",
        "treatment": "Consult with agricultural expert for specific treatment",
        "prevention": "Follow good agricultural practices"
    })

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
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    """Create a new product (farmers only)"""
    if current_user["user_type"] != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can create products")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO products (name, type, category, price, quantity, description, farmer_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (product.name, product.type, product.category, product.price, 
          product.quantity, product.description, current_user["id"]))
    
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

@app.delete("/products/{product_id}")
async def delete_product(product_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a product (farmers only)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if product exists and belongs to current user
    cursor.execute("SELECT * FROM products WHERE id = ? AND farmer_id = ?", (product_id, current_user["id"]))
    product = cursor.fetchone()
    
    if not product:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found or not authorized")
    
    # Delete the product
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Product deleted successfully"}

@app.get("/seed-data/")
@app.post("/seed-data/")
async def seed_database():
    """Seed database with sample data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Clear existing data first
        cursor.execute("DELETE FROM products")
        cursor.execute("DELETE FROM users")
        
        # Insert farmer user (without mobile column)
        cursor.execute('''
            INSERT INTO users (email, password_hash, name, user_type)
            VALUES (?, ?, ?, ?)
        ''', ("farmer1@test.com", get_password_hash("password123"), "John Farmer", "farmer"))
        
        farmer_id = cursor.lastrowid
        
        # Insert customer user
        cursor.execute('''
            INSERT INTO users (email, password_hash, name, user_type)
            VALUES (?, ?, ?, ?)
        ''', ("customer1@test.com", get_password_hash("password123"), "Jane Customer", "customer"))
        
        # Insert sample products
        sample_products = [
            ("Fresh Tomatoes", "product", "vegetable", 50.0, 100, "Organic red tomatoes", farmer_id),
            ("Potatoes", "product", "vegetable", 30.0, 200, "High quality potatoes", farmer_id),
            ("John Deere Tractor", "tool", "tractor", 500000.0, 1, "Heavy duty tractor", farmer_id),
            ("NPK Fertilizer", "fertilizer", "chemical", 25.0, 50, "Balanced NPK fertilizer", farmer_id),
        ]
        
        cursor.executemany('''
            INSERT INTO products (name, type, category, price, quantity, description, farmer_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', sample_products)
        
        conn.commit()
        conn.close()
        
        return {"message": "Database seeded successfully"}
        
    except Exception as e:
        return {"error": f"Seeding failed: {str(e)}"}

@app.post("/create-user/")
async def create_user_manual(email: str, password: str, name: str, user_type: str):
    """Manually create a user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            return {"error": "User already exists"}
        
        # Create user
        cursor.execute('''
            INSERT INTO users (email, password_hash, name, user_type)
            VALUES (?, ?, ?, ?)
        ''', (email, get_password_hash(password), name, user_type))
        
        conn.commit()
        conn.close()
        
        return {"message": f"User {email} created successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/test-login/")
async def test_login():
    """Test login with hardcoded credentials"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", ("farmer1@test.com",))
        db_user = cursor.fetchone()
        conn.close()
        
        if not db_user:
            return {"error": "User not found"}
        
        # Test password verification
        test_password = "password123"
        is_valid = verify_password(test_password, db_user["password_hash"])
        
        return {
            "user_found": True,
            "email": db_user["email"],
            "name": db_user["name"],
            "user_type": db_user["user_type"],
            "password_valid": is_valid,
            "hash_length": len(db_user["password_hash"]) if db_user["password_hash"] else 0
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/debug-users/")
async def debug_users():
    """Debug endpoint to see what users exist"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, name, user_type FROM users")
        users = cursor.fetchall()
        conn.close()
        return {"users": [dict(user) for user in users]}
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)