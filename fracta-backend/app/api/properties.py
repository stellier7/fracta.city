from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from datetime import datetime

from app.database import get_db
from app.models.property import Property
from app.models.user import User
from app.api.auth import get_current_user
from app.services.blockchain import blockchain_service

router = APIRouter()

# Pydantic models
class PropertyBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: str
    jurisdiction: str
    kyc_required: str
    full_price: float
    token_price: float
    total_tokens: int
    expected_yield: float
    property_type: Optional[str] = None
    square_feet: Optional[int] = None
    square_meters: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    features: Optional[List[str]] = None
    primary_image: Optional[str] = None
    image_gallery: Optional[List[str]] = None

class PropertyCreate(PropertyBase):
    @validator('jurisdiction')
    def validate_jurisdiction(cls, v):
        if v not in ['prospera', 'international']:
            raise ValueError('Jurisdiction must be prospera or international')
        return v
    
    @validator('kyc_required')
    def validate_kyc_required(cls, v):
        if v not in ['prospera-permit', 'international-kyc']:
            raise ValueError('KYC required must be prospera-permit or international-kyc')
        return v

class PropertyResponse(PropertyBase):
    id: int
    tokens_sold: int
    status: str
    listing_date: Optional[datetime]
    total_raised: float
    investor_count: int
    is_active: bool
    is_featured: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Computed properties
    tokens_remaining: int
    funding_percentage: float
    is_fully_funded: bool
    minimum_investment: float
    requires_prospera_permit: bool
    
    class Config:
        from_attributes = True

class PropertyListResponse(BaseModel):
    properties: List[PropertyResponse]
    total: int
    page: int
    size: int
    has_next: bool

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    expected_yield: Optional[float] = None
    is_featured: Optional[bool] = None
    
    @validator('status')
    def validate_status(cls, v):
        if v and v not in ['live', 'coming-soon', 'sold-out', 'closed']:
            raise ValueError('Status must be live, coming-soon, sold-out, or closed')
        return v

@router.get("/", response_model=PropertyListResponse)
async def get_properties(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    jurisdiction: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    featured_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get list of properties with pagination and filters"""
    
    # Build query
    query = db.query(Property).filter(Property.is_active == True)
    
    # Apply filters
    if jurisdiction:
        query = query.filter(Property.jurisdiction == jurisdiction)
    
    if status:
        query = query.filter(Property.status == status)
    
    if search:
        query = query.filter(
            Property.name.ilike(f"%{search}%") |
            Property.location.ilike(f"%{search}%") |
            Property.description.ilike(f"%{search}%")
        )
    
    if featured_only:
        query = query.filter(Property.is_featured == True)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * size
    properties = query.order_by(Property.created_at.desc()).offset(offset).limit(size).all()
    
    # Calculate computed properties
    property_responses = []
    for prop in properties:
        prop_dict = {
            **PropertyResponse.from_orm(prop).dict(),
            'tokens_remaining': prop.tokens_remaining,
            'funding_percentage': prop.funding_percentage,
            'is_fully_funded': prop.is_fully_funded,
            'minimum_investment': prop.minimum_investment,
            'requires_prospera_permit': prop.requires_prospera_permit
        }
        property_responses.append(PropertyResponse(**prop_dict))
    
    return PropertyListResponse(
        properties=property_responses,
        total=total,
        page=page,
        size=size,
        has_next=offset + size < total
    )

@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: int, db: Session = Depends(get_db)):
    """Get specific property by ID"""
    
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.is_active == True
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Include computed properties
    prop_dict = {
        **PropertyResponse.from_orm(property).dict(),
        'tokens_remaining': property.tokens_remaining,
        'funding_percentage': property.funding_percentage,
        'is_fully_funded': property.is_fully_funded,
        'minimum_investment': property.minimum_investment,
        'requires_prospera_permit': property.requires_prospera_permit
    }
    
    return PropertyResponse(**prop_dict)

@router.post("/", response_model=PropertyResponse)
async def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db)
):
    # For testing, use a mock user
    current_user = User(
        id=1,
        wallet_address="0x1234567890123456789012345678901234567890",
        kyc_status="approved",
        kyc_jurisdiction="prospera",
        prospera_permit_id="TEST123"
    )
    """Create new property (admin only)"""
    
    # Check if user is admin (temporarily disabled for testing)
    # if not current_user.is_admin:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only administrators can create properties"
    #     )
    
    # Create property
    property = Property(**property_data.dict())
    property.listing_date = datetime.utcnow()
    
    db.add(property)
    db.commit()
    db.refresh(property)
    
    # Include computed properties
    prop_dict = {
        **PropertyResponse.from_orm(property).dict(),
        'tokens_remaining': property.tokens_remaining,
        'funding_percentage': property.funding_percentage,
        'is_fully_funded': property.is_fully_funded,
        'minimum_investment': property.minimum_investment,
        'requires_prospera_permit': property.requires_prospera_permit
    }
    
    return PropertyResponse(**prop_dict)

@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: int,
    property_update: PropertyUpdate,
    db: Session = Depends(get_db)
):
    # For testing, use a mock user
    current_user = User(
        id=1,
        wallet_address="0x1234567890123456789012345678901234567890",
        kyc_status="approved",
        kyc_jurisdiction="prospera",
        prospera_permit_id="TEST123"
    )
    """Update property (admin only)"""
    
    # Check if user is admin (temporarily disabled for testing)
    # if not current_user.is_admin:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only administrators can update properties"
    #     )
    
    # Get property
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Update fields
    update_data = property_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property, field, value)
    
    db.commit()
    db.refresh(property)
    
    # Include computed properties
    prop_dict = {
        **PropertyResponse.from_orm(property).dict(),
        'tokens_remaining': property.tokens_remaining,
        'funding_percentage': property.funding_percentage,
        'is_fully_funded': property.is_fully_funded,
        'minimum_investment': property.minimum_investment,
        'requires_prospera_permit': property.requires_prospera_permit
    }
    
    return PropertyResponse(**prop_dict)

@router.get("/{property_id}/can-invest")
async def can_user_invest(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user can invest in property"""
    
    # Get property
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.is_active == True
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check various conditions
    can_invest = True
    reasons = []
    
    # Check property status
    if property.status != "live":
        can_invest = False
        reasons.append(f"Property is {property.status}")
    
    # Check if fully funded
    if property.is_fully_funded:
        can_invest = False
        reasons.append("Property is fully funded")
    
    # Check KYC requirements
    if property.requires_prospera_permit and not current_user.can_invest_in_prospera:
        can_invest = False
        if current_user.kyc_status != "approved":
            reasons.append("KYC verification required")
        elif current_user.kyc_jurisdiction != "prospera":
            reasons.append("Prospera permit required for this property")
    elif not property.requires_prospera_permit and not current_user.can_invest_international:
        can_invest = False
        if current_user.kyc_status != "approved":
            reasons.append("KYC verification required")
    
    # Check user account status
    if not current_user.is_active:
        can_invest = False
        reasons.append("Account is inactive")
    
    return {
        "can_invest": can_invest,
        "reasons": reasons,
        "property_status": property.status,
        "tokens_remaining": property.tokens_remaining,
        "minimum_investment": property.minimum_investment,
        "user_kyc_status": current_user.kyc_status,
        "user_jurisdiction": current_user.kyc_jurisdiction
    }

@router.get("/featured/list", response_model=List[PropertyResponse])
async def get_featured_properties(db: Session = Depends(get_db)):
    """Get featured properties for homepage"""
    
    properties = db.query(Property).filter(
        Property.is_active == True,
        Property.is_featured == True
    ).order_by(Property.created_at.desc()).limit(6).all()
    
    # Include computed properties
    property_responses = []
    for prop in properties:
        prop_dict = {
            **PropertyResponse.from_orm(prop).dict(),
            'tokens_remaining': prop.tokens_remaining,
            'funding_percentage': prop.funding_percentage,
            'is_fully_funded': prop.is_fully_funded,
            'minimum_investment': prop.minimum_investment,
            'requires_prospera_permit': prop.requires_prospera_permit
        }
        property_responses.append(PropertyResponse(**prop_dict))
    
    return property_responses

# NEW BLOCKCHAIN-INTEGRATED ENDPOINTS

@router.get("/blockchain/duna-studio")
async def get_duna_studio_blockchain_data():
    """Get real-time Duna Studio property data from blockchain"""
    try:
        property_data = await blockchain_service.get_duna_studio_property()
        return {
            "success": True,
            "data": property_data,
            "source": "blockchain",
            "network": blockchain_service.get_network_info()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "source": "blockchain_error",
            "fallback_data": {
                "id": "duna-studio",
                "name": "Duna Residences Studio",
                "location": "Roatán, Prospera ZEDE",
                "jurisdiction": "prospera",
                "fullPrice": 119000,
                "tokenPrice": 119,
                "totalTokens": 1190,
                "tokensSold": 0,
                "tokensRemaining": 1190,
                "expectedYield": 8.5,
                "image": "/images/dunaResidences/duna_studio_birdsView.png",
                "kycRequired": "prospera-permit",
                "status": "live"
            }
        }

@router.get("/blockchain/network-status")
async def get_network_status():
    """Get blockchain network status and connection info"""
    try:
        return {
            "success": True,
            "network": blockchain_service.get_network_info()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "network": {
                "connected": False,
                "chain_id": 84532,
                "network_name": "Base Testnet"
            }
        }

@router.get("/blockchain/user/{wallet_address}/kyc")
async def get_user_blockchain_kyc(wallet_address: str):
    """Get user KYC status from blockchain"""
    try:
        if not blockchain_service.is_valid_address(wallet_address):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid wallet address"
            )
        
        # For testing, return mock approved KYC for the user's wallet
        if wallet_address.lower() == "0xdf7dc773d20827e4796cbeaff5113b4f9514be34":
            return {
                "success": True,
                "wallet_address": wallet_address,
                "kyc_status": {
                    "kyc_valid": True,
                    "jurisdiction": "prospera",
                    "expiry": int(datetime.utcnow().timestamp()) + (365 * 24 * 60 * 60),  # 1 year from now
                    "has_prospera_permit": True,
                    "permit_id": "TEST123"
                }
            }
        
        # For other addresses, check the blockchain
        kyc_status = await blockchain_service.check_user_kyc_status(wallet_address)
        return {
            "success": True,
            "wallet_address": wallet_address,
            "kyc_status": kyc_status
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "wallet_address": wallet_address,
            "kyc_status": {
                "kyc_valid": False,
                "jurisdiction": "",
                "expiry": 0,
                "has_prospera_permit": False,
                "permit_id": ""
            }
        }

@router.get("/blockchain/user/{wallet_address}/balance")
async def get_user_token_balance(wallet_address: str):
    """Get user's Duna Studio token balance from blockchain"""
    try:
        if not blockchain_service.is_valid_address(wallet_address):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid wallet address"
            )
        
        balance = await blockchain_service.get_user_token_balance(wallet_address)
        return {
            "success": True,
            "wallet_address": wallet_address,
            "balance": balance,
            "property": "Duna Residences Studio",
            "contract_address": blockchain_service.duna_studio_token_address
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "wallet_address": wallet_address,
            "balance": 0
        }

@router.get("/blockchain/live-properties")
async def get_live_blockchain_properties():
    """Get all live properties with real blockchain data"""
    try:
        # Get Duna Studio from blockchain
        duna_data = await blockchain_service.get_duna_studio_property()
        
        # Mock data for other properties (until they're deployed)
        mock_properties = [
            {
                "id": "las-verandas",
                "name": "Las Verandas Villa",
                "location": "Roatán, Prospera ZEDE",
                "jurisdiction": "prospera",
                "fullPrice": 950000,
                "tokenPrice": 950,
                "totalTokens": 1000,
                "tokensSold": 0,
                "tokensRemaining": 1000,
                "expectedYield": 7.2,
                "image": "/images/lasVerandas/lasVerandas_twoStory_twoBedroom.png",
                "kycRequired": "prospera-permit",
                "status": "coming-soon",
                "contractAddress": None
            },
            {
                "id": "duna-two-bedroom",
                "name": "Duna Residences, Two Bedroom",
                "location": "Roatán, Prospera ZEDE", 
                "jurisdiction": "prospera",
                "fullPrice": 239500,
                "tokenPrice": 240,
                "totalTokens": 1000,
                "tokensSold": 0,
                "tokensRemaining": 1000,
                "expectedYield": 8.1,
                "image": "/images/dunaResidences/duna_twoBedroom_birdsView.png",
                "kycRequired": "prospera-permit",
                "status": "coming-soon",
                "contractAddress": None
            },
            {
                "id": "pristine-bay-villa",
                "name": "Pristine Bay, Villa 1111",
                "location": "Roatán, Prospera ZEDE",
                "jurisdiction": "prospera", 
                "fullPrice": 890000,
                "tokenPrice": 890,
                "totalTokens": 1000,
                "tokensSold": 0,
                "tokensRemaining": 1000,
                "expectedYield": 6.8,
                "image": "/images/pristineBay/PB_1111_1.png",
                "kycRequired": "prospera-permit",
                "status": "coming-soon",
                "contractAddress": None
            }
        ]
        
        # Combine blockchain data with mock data
        all_properties = [duna_data] + mock_properties
        
        return {
            "success": True,
            "properties": all_properties,
            "blockchain_properties": 1,
            "mock_properties": len(mock_properties),
            "network": blockchain_service.get_network_info()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "properties": []
        } 