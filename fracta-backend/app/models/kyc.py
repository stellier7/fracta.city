from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class KYCRecord(Base):
    __tablename__ = "kyc_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # KYC Type and Status
    kyc_type = Column(String(20), nullable=False)  # prospera-permit, international-kyc
    status = Column(String(20), default="pending")  # pending, approved, rejected, expired
    jurisdiction = Column(String(20), nullable=False)  # prospera, international
    
    # Prospera-specific fields
    prospera_permit_id = Column(String(100), nullable=True)
    prospera_permit_expiry = Column(DateTime, nullable=True)
    prospera_permit_type = Column(String(50), nullable=True)  # resident, investor, business
    
    # International KYC fields
    document_type = Column(String(30), nullable=True)  # passport, drivers_license, national_id
    document_number = Column(String(100), nullable=True)
    document_country = Column(String(100), nullable=True)
    document_expiry = Column(DateTime, nullable=True)
    
    # Personal Information (encrypted/hashed in production)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    nationality = Column(String(100), nullable=True)
    country_of_residence = Column(String(100), nullable=True)
    
    # Address Information
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    state_province = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    address_country = Column(String(100), nullable=True)
    
    # Document Storage
    documents = Column(JSON, nullable=True)  # Array of document file paths/URLs
    document_hashes = Column(JSON, nullable=True)  # Document integrity verification
    
    # Verification Process
    verification_method = Column(String(50), nullable=True)  # manual, automated, third_party
    verified_by = Column(String(100), nullable=True)  # Admin user or service name
    verification_notes = Column(Text, nullable=True)
    
    # External Service Integration
    external_kyc_id = Column(String(100), nullable=True)  # Third-party KYC service ID
    external_service = Column(String(50), nullable=True)  # jumio, onfido, etc.
    external_response = Column(JSON, nullable=True)  # Raw response from external service
    
    # Risk Assessment
    risk_score = Column(Integer, nullable=True)  # 0-100 risk score
    risk_level = Column(String(20), nullable=True)  # low, medium, high
    sanctions_check = Column(Boolean, default=False)
    pep_check = Column(Boolean, default=False)  # Politically Exposed Person
    
    # Compliance
    compliance_status = Column(String(20), default="pending")  # compliant, non_compliant, review
    compliance_notes = Column(Text, nullable=True)
    annual_review_due = Column(DateTime, nullable=True)
    
    # Timestamps
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="kyc_records")
    
    def __repr__(self):
        return f"<KYCRecord(user_id={self.user_id}, type={self.kyc_type}, status={self.status})>"
    
    @property
    def is_approved(self):
        return self.status == "approved"
    
    @property
    def is_expired(self):
        if self.expires_at:
            return self.expires_at < func.now()
        return False
    
    @property
    def is_valid(self):
        return self.is_approved and not self.is_expired
    
    @property
    def requires_renewal(self):
        if self.annual_review_due:
            return self.annual_review_due < func.now()
        return False

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    
    # Investment Details
    tokens_purchased = Column(Integer, nullable=False)
    token_price_at_purchase = Column(Text, nullable=False)  # Price per token at time of purchase
    total_amount = Column(Text, nullable=False)  # Total investment amount
    
    # Blockchain Transaction
    transaction_hash = Column(String(66), nullable=True)  # Blockchain tx hash
    block_number = Column(Integer, nullable=True)
    contract_address = Column(String(42), nullable=True)
    
    # Status
    status = Column(String(20), default="pending")  # pending, confirmed, failed, refunded
    payment_method = Column(String(30), nullable=True)  # crypto, bank_transfer, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="investments")
    property = relationship("Property", back_populates="investments")
    
    def __repr__(self):
        return f"<Investment(user_id={self.user_id}, property_id={self.property_id}, tokens={self.tokens_purchased})>" 