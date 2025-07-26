from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String(42), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    
    # KYC Status
    kyc_status = Column(String(20), default="pending")  # pending, approved, rejected
    kyc_jurisdiction = Column(String(20), nullable=True)  # prospera, international
    prospera_permit_id = Column(String(100), nullable=True)
    
    # Profile Information
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    
    # Account Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    
    # Portfolio Information
    total_invested = Column(Numeric(20, 2), default=0)
    portfolio_value = Column(Numeric(20, 2), default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    kyc_records = relationship("KYCRecord", back_populates="user")
    investments = relationship("Investment", back_populates="user")
    
    def __repr__(self):
        return f"<User(wallet={self.wallet_address}, kyc_status={self.kyc_status})>"
    
    @property
    def is_kyc_approved(self):
        return self.kyc_status == "approved"
    
    @property
    def can_invest_in_prospera(self):
        return self.is_kyc_approved and self.kyc_jurisdiction == "prospera"
    
    @property
    def can_invest_international(self):
        return self.is_kyc_approved and self.kyc_jurisdiction in ["prospera", "international"] 