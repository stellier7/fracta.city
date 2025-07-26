from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Property Information
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    location = Column(String(200), nullable=False)
    
    # Jurisdiction and Legal
    jurisdiction = Column(String(20), nullable=False)  # prospera, international
    kyc_required = Column(String(30), nullable=False)  # prospera-permit, international-kyc
    
    # Financial Information
    full_price = Column(Numeric(20, 2), nullable=False)  # Full property value
    token_price = Column(Numeric(10, 2), nullable=False)  # Price per token
    total_tokens = Column(Integer, nullable=False)  # Total tokens available
    tokens_sold = Column(Integer, default=0)  # Tokens already sold
    expected_yield = Column(Numeric(5, 2), nullable=False)  # Expected annual yield %
    
    # Property Details
    property_type = Column(String(50), nullable=True)  # studio, villa, condo, etc.
    square_feet = Column(Integer, nullable=True)
    square_meters = Column(Integer, nullable=True)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    features = Column(JSON, nullable=True)  # Array of features
    
    # Images and Media
    primary_image = Column(String(500), nullable=True)
    image_gallery = Column(JSON, nullable=True)  # Array of image URLs
    virtual_tour_url = Column(String(500), nullable=True)
    
    # Investment Status
    status = Column(String(20), default="coming-soon")  # live, coming-soon, sold-out, closed
    listing_date = Column(DateTime(timezone=True), nullable=True)
    sale_start_date = Column(DateTime(timezone=True), nullable=True)
    sale_end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Blockchain Information
    contract_address = Column(String(42), nullable=True)  # Smart contract address
    token_standard = Column(String(10), default="ERC-20")  # ERC-20, ERC-1155, etc.
    
    # Legal Documents
    legal_documents = Column(JSON, nullable=True)  # Array of document URLs
    property_deed_url = Column(String(500), nullable=True)
    
    # Performance Tracking
    total_raised = Column(Numeric(20, 2), default=0)
    investor_count = Column(Integer, default=0)
    monthly_rent = Column(Numeric(10, 2), nullable=True)
    occupancy_rate = Column(Numeric(5, 2), default=0)  # Percentage
    
    # Administrative
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    admin_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    investments = relationship("Investment", back_populates="property")
    
    def __repr__(self):
        return f"<Property(name={self.name}, status={self.status}, jurisdiction={self.jurisdiction})>"
    
    @property
    def tokens_remaining(self):
        return self.total_tokens - self.tokens_sold
    
    @property
    def funding_percentage(self):
        if self.total_tokens == 0:
            return 0
        return (self.tokens_sold / self.total_tokens) * 100
    
    @property
    def is_fully_funded(self):
        return self.tokens_sold >= self.total_tokens
    
    @property
    def minimum_investment(self):
        return self.token_price
    
    @property
    def requires_prospera_permit(self):
        return self.kyc_required == "prospera-permit" 