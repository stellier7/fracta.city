from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.property import Property
from app.models.kyc import Investment, Token
from app.api.auth import get_current_user
from app.services.blockchain import blockchain_service

router = APIRouter()

# Pydantic models
class PurchaseRequest(BaseModel):
    property_id: int
    token_amount: int
    
    class Config:
        from_attributes = True

class MintTokenRequest(BaseModel):
    property_id: int
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    id: int
    token_number: int
    property_id: int
    owner_id: int
    mint_price: float
    current_price: Optional[float] = None
    is_for_sale: bool
    minted_at: datetime
    
    class Config:
        from_attributes = True

class PurchaseResponse(BaseModel):
    success: bool
    transaction_hash: Optional[str] = None
    tokens_purchased: Optional[int] = None
    total_cost: Optional[float] = None
    error: Optional[str] = None
    
    class Config:
        from_attributes = True

class TransactionStatus(BaseModel):
    hash: str
    status: str  # 'pending', 'success', 'failed'
    block_number: Optional[int] = None
    gas_used: Optional[int] = None
    error: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserTransaction(BaseModel):
    id: int
    property_id: int
    property_name: str
    tokens_purchased: int
    token_price_at_purchase: float
    total_cost: float
    transaction_hash: Optional[str] = None
    purchase_date: datetime
    status: str
    
    class Config:
        from_attributes = True

@router.post("/mint-token", response_model=TokenResponse)
async def mint_token(
    mint_request: MintTokenRequest,
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
    """Mint a new token for a property"""
    try:
        # Get the property
        property = db.query(Property).filter(Property.id == mint_request.property_id).first()
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        
        # Check if property is live
        if property.status != 'live':
            raise HTTPException(status_code=400, detail="Property is not available for minting")
        
        # Check if user has valid KYC
        if not current_user.kyc_status == 'approved':
            raise HTTPException(status_code=403, detail="KYC verification required")
        
        # Check if property requires Prospera permit
        if property.kyc_required == 'prospera-permit':
            if not current_user.can_invest_in_prospera:
                raise HTTPException(status_code=403, detail="Prospera permit required for this property")
        
        # Get the next token number for this property
        last_token = db.query(Token).filter(
            Token.property_id == mint_request.property_id
        ).order_by(Token.token_number.desc()).first()
        
        next_token_number = (last_token.token_number + 1) if last_token else 1
        
        # Check if we haven't exceeded total tokens
        if next_token_number > property.total_tokens:
            raise HTTPException(status_code=400, detail="All tokens have been minted")
        
        # Create the token
        token = Token(
            token_number=next_token_number,
            property_id=mint_request.property_id,
            owner_id=current_user.id,
            mint_price=property.token_price,
            is_for_sale=False
        )
        
        # Update property tokens sold
        property.tokens_sold += 1
        
        db.add(token)
        db.commit()
        db.refresh(token)
        
        return TokenResponse(
            id=token.id,
            token_number=token.token_number,
            property_id=token.property_id,
            owner_id=token.owner_id,
            mint_price=float(token.mint_price),
            current_price=float(token.current_price) if token.current_price else None,
            is_for_sale=token.is_for_sale,
            minted_at=token.minted_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Token minting failed: {str(e)}")

@router.get("/tokens/{property_id}", response_model=List[TokenResponse])
async def get_property_tokens(
    property_id: int,
    db: Session = Depends(get_db)
):
    """Get all tokens for a property"""
    try:
        tokens = db.query(Token).filter(
            Token.property_id == property_id
        ).order_by(Token.token_number).all()
        
        return [
            TokenResponse(
                id=token.id,
                token_number=token.token_number,
                property_id=token.property_id,
                owner_id=token.owner_id,
                mint_price=float(token.mint_price),
                current_price=float(token.current_price) if token.current_price else None,
                is_for_sale=token.is_for_sale,
                minted_at=token.minted_at
            )
            for token in tokens
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tokens: {str(e)}")

@router.post("/purchase", response_model=PurchaseResponse)
async def purchase_tokens(
    purchase_request: PurchaseRequest,
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
    """Purchase tokens for a property"""
    try:
        # Get the property
        property = db.query(Property).filter(Property.id == purchase_request.property_id).first()
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        
        # Check if property is live
        if property.status != 'live':
            raise HTTPException(status_code=400, detail="Property is not available for purchase")
        
        # Check if user has valid KYC
        if not current_user.kyc_status == 'approved':
            raise HTTPException(status_code=403, detail="KYC verification required")
        
        # Check if property requires Prospera permit
        if property.kyc_required == 'prospera-permit':
            if not current_user.can_invest_in_prospera:
                raise HTTPException(status_code=403, detail="Prospera permit required for this property")
        
        # Check if enough tokens are available
        if property.tokens_sold + purchase_request.token_amount > property.total_tokens:
            raise HTTPException(status_code=400, detail="Not enough tokens available")
        
        # Calculate total cost
        total_cost = purchase_request.token_amount * property.token_price
        
        # For now, simulate a successful transaction
        # In a real implementation, this would call the blockchain service
        transaction_hash = f"0x{hash(f'{current_user.id}{property.id}{datetime.now()}') % 10**64:064x}"
        
        # Create investment record
        investment = Investment(
            user_id=current_user.id,
            property_id=property.id,
            tokens_purchased=purchase_request.token_amount,
            token_price_at_purchase=str(property.token_price),
            total_amount=str(total_cost),
            transaction_hash=transaction_hash,
            status="confirmed"
        )
        
        # Update property tokens sold
        property.tokens_sold += purchase_request.token_amount
        
        db.add(investment)
        db.commit()
        
        return PurchaseResponse(
            success=True,
            transaction_hash=transaction_hash,
            tokens_purchased=purchase_request.token_amount,
            total_cost=total_cost
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Purchase failed: {str(e)}")

@router.get("/status/{transaction_hash}", response_model=TransactionStatus)
async def get_transaction_status(
    transaction_hash: str,
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
    """Get the status of a transaction"""
    try:
        # Find the investment record
        investment = db.query(Investment).filter(
            Investment.transaction_hash == transaction_hash,
            Investment.user_id == current_user.id
        ).first()
        
        if not investment:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # For now, return a simulated status
        # In a real implementation, this would check the blockchain
        return TransactionStatus(
            hash=transaction_hash,
            status='success',  # Simulated
            block_number=12345678,  # Simulated
            gas_used=21000  # Simulated
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get transaction status: {str(e)}")

@router.get("/user/transactions", response_model=List[UserTransaction])
async def get_user_transactions(
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
    """Get all transactions for the current user"""
    try:
        # Get user's investments with property details
        investments = db.query(
            Investment,
            Property.name.label('property_name')
        ).join(
            Property, Investment.property_id == Property.id
        ).filter(
            Investment.user_id == current_user.id
        ).order_by(
            Investment.created_at.desc()
        ).all()
        
        transactions = []
        for investment, property_name in investments:
            transactions.append(UserTransaction(
                id=investment.id,
                property_id=investment.property_id,
                property_name=property_name,
                tokens_purchased=investment.tokens_purchased,
                token_price_at_purchase=float(investment.token_price_at_purchase),
                total_cost=float(investment.total_amount),
                transaction_hash=investment.transaction_hash,
                purchase_date=investment.created_at,
                status='completed'  # Simulated
            ))
        
        return transactions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user transactions: {str(e)}")

@router.get("/user/portfolio")
async def get_user_portfolio(
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
    """Get user's investment portfolio summary"""
    try:
        # Get user's investments
        investments = db.query(Investment).filter(
            Investment.user_id == current_user.id
        ).all()
        
        total_invested = sum(float(inv.total_amount) for inv in investments)
        total_tokens = sum(inv.tokens_purchased for inv in investments)
        properties_count = len(set(inv.property_id for inv in investments))
        
        # Calculate current value (simplified)
        current_value = total_invested * 1.05  # Simulated 5% appreciation
        
        return {
            "total_invested": total_invested,
            "current_value": current_value,
            "total_tokens": total_tokens,
            "properties_count": properties_count,
            "total_return": current_value - total_invested,
            "return_percentage": ((current_value - total_invested) / total_invested * 100) if total_invested > 0 else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get portfolio: {str(e)}") 