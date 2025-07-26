import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from pydantic import BaseModel, validator
from web3 import Web3

from app.database import get_db
from app.models.user import User

router = APIRouter()
security = HTTPBearer()

# Pydantic models
class WalletLoginRequest(BaseModel):
    wallet_address: str
    signature: str
    message: str
    
    @validator('wallet_address')
    def validate_wallet_address(cls, v):
        if not Web3.is_address(v):
            raise ValueError('Invalid wallet address format')
        return Web3.to_checksum_address(v)

class UserResponse(BaseModel):
    id: int
    wallet_address: str
    email: Optional[str]
    kyc_status: str
    kyc_jurisdiction: Optional[str]
    is_verified: bool
    total_invested: float
    portfolio_value: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_wallet_signature(message: str, signature: str, wallet_address: str) -> bool:
    """Verify wallet signature for authentication"""
    try:
        # Create Web3 instance
        w3 = Web3()
        
        # Recover address from signature
        message_hash = w3.keccak(text=message)
        recovered_address = w3.eth.account.recover_message(
            message_hash, signature=signature
        )
        
        # Compare addresses (case-insensitive)
        return recovered_address.lower() == wallet_address.lower()
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        wallet_address: str = payload.get("sub")
        if wallet_address is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    if user is None:
        raise credentials_exception
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return user

@router.post("/wallet-login", response_model=TokenResponse)
async def wallet_login(login_request: WalletLoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with wallet signature"""
    
    # Verify signature
    if not verify_wallet_signature(
        login_request.message, 
        login_request.signature, 
        login_request.wallet_address
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature"
        )
    
    # Check if user exists, create if not
    user = db.query(User).filter(User.wallet_address == login_request.wallet_address).first()
    if not user:
        user = User(
            wallet_address=login_request.wallet_address,
            last_login=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.last_login = datetime.utcnow()
        db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.wallet_address}, 
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.from_orm(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse.from_orm(current_user)

@router.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_user)):
    """Verify if token is valid"""
    return {
        "valid": True,
        "wallet_address": current_user.wallet_address,
        "kyc_status": current_user.kyc_status
    }

@router.post("/logout")
async def logout():
    """Logout endpoint (client-side token removal)"""
    return {"message": "Successfully logged out"}

@router.get("/nonce/{wallet_address}")
async def get_nonce(wallet_address: str):
    """Get nonce for wallet signature (message to sign)"""
    if not Web3.is_address(wallet_address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid wallet address"
        )
    
    # Generate a unique message to sign
    timestamp = int(datetime.utcnow().timestamp())
    nonce = f"Fracta.city Login\nWallet: {wallet_address}\nTimestamp: {timestamp}"
    
    return {
        "message": nonce,
        "timestamp": timestamp
    } 