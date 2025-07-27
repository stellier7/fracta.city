import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api import auth, properties, kyc, transactions
from app.database import create_database
from app.services.blockchain import blockchain_service

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title=os.getenv("PROJECT_NAME", "Fracta.city Backend"),
    description="Backend API for Fracta.city - Tokenized Real Estate Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "https://fracta.city",
    "https://www.fracta.city"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
API_V1_STR = os.getenv("API_V1_STR", "/api/v1")

app.include_router(auth.router, prefix=f"{API_V1_STR}/auth", tags=["authentication"])
app.include_router(properties.router, prefix=f"{API_V1_STR}/properties", tags=["properties"])
app.include_router(kyc.router, prefix=f"{API_V1_STR}/kyc", tags=["kyc"])
app.include_router(transactions.router, prefix=f"{API_V1_STR}/transactions", tags=["transactions"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Fracta.city Backend API",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        network_info = blockchain_service.get_network_info()
        blockchain_status = "connected" if network_info["connected"] else "disconnected"
    except Exception as e:
        blockchain_status = f"error: {str(e)[:50]}"
        network_info = {"connected": False, "chain_id": 84532}
    
    return {
        "status": "healthy",
        "database": "connected",
        "blockchain": {
            "status": blockchain_status,
            "network": network_info.get("network_name", "Base Testnet"),
            "chain_id": network_info.get("chain_id", 84532),
            "contracts": {
                "compliance_manager": os.getenv("COMPLIANCE_MANAGER_ADDRESS", "Not configured"),
                "duna_studio_token": os.getenv("DUNA_STUDIO_TOKEN_ADDRESS", "Not configured")
            }
        }
    }

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_database()
    print("✅ Fracta.city Backend started successfully!")
    print(f"📊 Database: {os.getenv('DATABASE_URL', 'Not configured')[:50]}...")
    
    # Test blockchain connection
    try:
        network_info = blockchain_service.get_network_info()
        if network_info["connected"]:
            print(f"🔗 Blockchain: ✅ Connected to {network_info['network_name']} (Chain ID: {network_info['chain_id']})")
            print(f"📋 ComplianceManager: {os.getenv('COMPLIANCE_MANAGER_ADDRESS', 'Not configured')}")
            print(f"🏠 Duna Studio Token: {os.getenv('DUNA_STUDIO_TOKEN_ADDRESS', 'Not configured')}")
        else:
            print("🔗 Blockchain: ❌ Connection failed")
    except Exception as e:
        print(f"🔗 Blockchain: ❌ Error - {str(e)}")
    
    print(f"🌐 Frontend CORS: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}")
    print("🚀 Backend ready for Phase 4 integration!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 