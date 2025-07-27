from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.kyc import KYCRecord
from app.api.auth import get_current_user

router = APIRouter()

# Pydantic models
class ProspectsPermitRequest(BaseModel):
    prospera_permit_id: str
    prospera_permit_type: str
    first_name: str
    last_name: str
    date_of_birth: str
    nationality: str
    
    @validator('prospera_permit_type')
    def validate_permit_type(cls, v):
        if v not in ['resident', 'investor', 'business']:
            raise ValueError('Permit type must be resident, investor, or business')
        return v

class InternationalKYCRequest(BaseModel):
    document_type: str
    document_number: str
    document_country: str
    document_expiry: str
    first_name: str
    last_name: str
    date_of_birth: str
    nationality: str
    country_of_residence: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state_province: Optional[str] = None
    postal_code: str
    address_country: str
    
    @validator('document_type')
    def validate_document_type(cls, v):
        if v not in ['passport', 'drivers_license', 'national_id']:
            raise ValueError('Document type must be passport, drivers_license, or national_id')
        return v

class KYCResponse(BaseModel):
    id: int
    user_id: int
    kyc_type: str
    status: str
    jurisdiction: str
    prospera_permit_id: Optional[str]
    document_type: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    verification_method: Optional[str]
    risk_level: Optional[str]
    compliance_status: str
    submitted_at: datetime
    reviewed_at: Optional[datetime]
    approved_at: Optional[datetime]
    expires_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class KYCStatusResponse(BaseModel):
    has_kyc: bool
    kyc_status: str
    kyc_jurisdiction: Optional[str]
    can_invest_prospera: bool
    can_invest_international: bool
    requires_renewal: bool
    next_steps: List[str]

@router.get("/status", response_model=KYCStatusResponse)
async def get_kyc_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's KYC status"""
    
    # Get latest KYC record
    latest_kyc = db.query(KYCRecord).filter(
        KYCRecord.user_id == current_user.id
    ).order_by(KYCRecord.created_at.desc()).first()
    
    next_steps = []
    
    if not latest_kyc:
        next_steps = [
            "Complete KYC verification to start investing",
            "Choose between Prospera permit or international KYC"
        ]
    elif latest_kyc.status == "pending":
        next_steps = ["KYC verification is being reviewed"]
    elif latest_kyc.status == "rejected":
        next_steps = [
            "Previous KYC was rejected",
            "Contact support or submit new documentation"
        ]
    elif latest_kyc.requires_renewal:
        next_steps = ["KYC renewal required - please update your information"]
    elif current_user.kyc_status == "approved":
        if current_user.kyc_jurisdiction == "prospera":
            next_steps = ["You can invest in all Prospera properties"]
        else:
            next_steps = ["You can invest in international properties"]
    
    return KYCStatusResponse(
        has_kyc=latest_kyc is not None,
        kyc_status=current_user.kyc_status,
        kyc_jurisdiction=current_user.kyc_jurisdiction,
        can_invest_prospera=current_user.can_invest_in_prospera,
        can_invest_international=current_user.can_invest_international,
        requires_renewal=latest_kyc.requires_renewal if latest_kyc else False,
        next_steps=next_steps
    )

@router.post("/test-prospera-verify", response_model=KYCResponse)
async def submit_test_prospera_verification(
    kyc_data: ProspectsPermitRequest,
    db: Session = Depends(get_db)
):
    """Submit Prospera permit for verification (test endpoint without auth)"""
    
    # For testing, create a mock user ID
    mock_user_id = 1
    
    # Check if user already has approved KYC
    existing_kyc = db.query(KYCRecord).filter(
        KYCRecord.user_id == mock_user_id,
        KYCRecord.status == "approved"
    ).first()
    
    if existing_kyc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has approved KYC verification"
        )
    
    # Parse date
    try:
        dob = datetime.strptime(kyc_data.date_of_birth, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Create KYC record
    kyc_record = KYCRecord(
        user_id=mock_user_id,
        kyc_type="prospera-permit",
        jurisdiction="prospera",
        prospera_permit_id=kyc_data.prospera_permit_id,
        prospera_permit_type=kyc_data.prospera_permit_type,
        first_name=kyc_data.first_name,
        last_name=kyc_data.last_name,
        date_of_birth=dob,
        nationality=kyc_data.nationality,
        verification_method="manual",
        compliance_status="pending"
    )
    
    # Set expiry (Prospera permits typically valid for 1 year)
    kyc_record.expires_at = datetime.utcnow() + timedelta(days=365)
    kyc_record.annual_review_due = datetime.utcnow() + timedelta(days=365)
    
    db.add(kyc_record)
    
    # For testing, we'll skip updating user status since we don't have a real user
    # In production, you'd update the user's KYC status here
    
    db.commit()
    db.refresh(kyc_record)
    
    return KYCResponse.from_orm(kyc_record)

@router.post("/prospera-verify", response_model=KYCResponse)
async def submit_prospera_verification(
    kyc_data: ProspectsPermitRequest,
    db: Session = Depends(get_db)
):
    """Submit Prospera permit for verification (test endpoint without auth)"""
    
    # For testing, create a mock user ID
    mock_user_id = 1
    
    # Check if user already has approved KYC
    existing_kyc = db.query(KYCRecord).filter(
        KYCRecord.user_id == mock_user_id,
        KYCRecord.status == "approved"
    ).first()
    
    if existing_kyc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has approved KYC verification"
        )
    
    # Parse date
    try:
        dob = datetime.strptime(kyc_data.date_of_birth, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Create KYC record
    kyc_record = KYCRecord(
        user_id=mock_user_id,
        kyc_type="prospera-permit",
        jurisdiction="prospera",
        prospera_permit_id=kyc_data.prospera_permit_id,
        prospera_permit_type=kyc_data.prospera_permit_type,
        first_name=kyc_data.first_name,
        last_name=kyc_data.last_name,
        date_of_birth=dob,
        nationality=kyc_data.nationality,
        verification_method="manual",
        compliance_status="pending"
    )
    
    # Set expiry (Prospera permits typically valid for 1 year)
    kyc_record.expires_at = datetime.utcnow() + timedelta(days=365)
    kyc_record.annual_review_due = datetime.utcnow() + timedelta(days=365)
    
    db.add(kyc_record)
    
    # For testing, we'll skip updating user status since we don't have a real user
    # In production, you'd update the user's KYC status here
    
    db.commit()
    db.refresh(kyc_record)
    
    return KYCResponse.from_orm(kyc_record)

@router.post("/international-verify", response_model=KYCResponse)
async def submit_international_verification(
    kyc_data: InternationalKYCRequest,
    db: Session = Depends(get_db)
):
    """Submit international KYC for verification (test endpoint without auth)"""
    
    # For testing, create a mock user ID
    mock_user_id = 1
    
    # Check if user already has approved KYC
    existing_kyc = db.query(KYCRecord).filter(
        KYCRecord.user_id == mock_user_id,
        KYCRecord.status == "approved"
    ).first()
    
    if existing_kyc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has approved KYC verification"
        )
    
    # Parse dates
    try:
        dob = datetime.strptime(kyc_data.date_of_birth, "%Y-%m-%d")
        doc_expiry = datetime.strptime(kyc_data.document_expiry, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Create KYC record
    kyc_record = KYCRecord(
        user_id=mock_user_id,
        kyc_type="international-kyc",
        jurisdiction="international",
        document_type=kyc_data.document_type,
        document_number=kyc_data.document_number,
        document_country=kyc_data.document_country,
        document_expiry=doc_expiry,
        first_name=kyc_data.first_name,
        last_name=kyc_data.last_name,
        date_of_birth=dob,
        nationality=kyc_data.nationality,
        country_of_residence=kyc_data.country_of_residence,
        address_line1=kyc_data.address_line1,
        address_line2=kyc_data.address_line2,
        city=kyc_data.city,
        state_province=kyc_data.state_province,
        postal_code=kyc_data.postal_code,
        address_country=kyc_data.address_country,
        verification_method="manual",
        compliance_status="pending"
    )
    
    # Set expiry based on document expiry
    kyc_record.expires_at = doc_expiry
    kyc_record.annual_review_due = datetime.utcnow() + timedelta(days=365)
    
    db.add(kyc_record)
    
    # Update user KYC status
    # current_user.kyc_status = "pending" # This line was removed as per the edit hint
    # current_user.kyc_jurisdiction = "international" # This line was removed as per the edit hint
    # current_user.first_name = kyc_data.first_name # This line was removed as per the edit hint
    # current_user.last_name = kyc_data.last_name # This line was removed as per the edit hint
    # current_user.country = kyc_data.country_of_residence # This line was removed as per the edit hint
    # current_user.date_of_birth = dob # This line was removed as per the edit hint
    
    db.commit()
    db.refresh(kyc_record)
    
    return KYCResponse.from_orm(kyc_record)

@router.get("/records", response_model=List[KYCResponse])
async def get_kyc_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's KYC records"""
    
    records = db.query(KYCRecord).filter(
        KYCRecord.user_id == current_user.id
    ).order_by(KYCRecord.created_at.desc()).all()
    
    return [KYCResponse.from_orm(record) for record in records]

@router.post("/upload-document")
async def upload_kyc_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload KYC document (placeholder for file upload)"""
    
    # In production, this would:
    # 1. Validate file type and size
    # 2. Store file securely (encrypted)
    # 3. Update KYC record with document reference
    # 4. Possibly trigger automated verification
    
    # Get latest KYC record
    latest_kyc = db.query(KYCRecord).filter(
        KYCRecord.user_id == current_user.id
    ).order_by(KYCRecord.created_at.desc()).first()
    
    if not latest_kyc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No KYC record found. Please submit KYC information first."
        )
    
    # Simulate file processing
    return {
        "message": "Document uploaded successfully",
        "filename": file.filename,
        "size": file.size,
        "kyc_record_id": latest_kyc.id,
        "status": "processing"
    }

# Admin endpoints
@router.get("/admin/pending", response_model=List[KYCResponse])
async def get_pending_kyc_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending KYC reviews (admin only)"""
    
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access this endpoint"
        )
    
    pending_records = db.query(KYCRecord).filter(
        KYCRecord.status == "pending"
    ).order_by(KYCRecord.submitted_at.asc()).all()
    
    return [KYCResponse.from_orm(record) for record in pending_records]

@router.get("/test-admin/all", response_model=List[KYCResponse])
async def get_test_all_kyc_records(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = None,
    jurisdiction_filter: Optional[str] = None
):
    """Get all KYC records with optional filtering (test endpoint without auth)"""
    
    query = db.query(KYCRecord)
    
    if status_filter and status_filter != "all":
        query = query.filter(KYCRecord.status == status_filter)
    
    if jurisdiction_filter and jurisdiction_filter != "all":
        query = query.filter(KYCRecord.jurisdiction == jurisdiction_filter)
    
    records = query.order_by(KYCRecord.submitted_at.desc()).all()
    
    return [KYCResponse.from_orm(record) for record in records]

@router.get("/admin/all", response_model=List[KYCResponse])
async def get_all_kyc_records(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = None,
    jurisdiction_filter: Optional[str] = None
):
    """Get all KYC records with optional filtering (admin only)"""
    
    query = db.query(KYCRecord)
    
    if status_filter and status_filter != "all":
        query = query.filter(KYCRecord.status == status_filter)
    
    if jurisdiction_filter and jurisdiction_filter != "all":
        query = query.filter(KYCRecord.jurisdiction == jurisdiction_filter)
    
    records = query.order_by(KYCRecord.submitted_at.desc()).all()
    
    return [KYCResponse.from_orm(record) for record in records]

@router.get("/admin/{kyc_id}", response_model=KYCResponse)
async def get_kyc_record_details(
    kyc_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed KYC record (admin only)"""
    
    kyc_record = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).first()
    if not kyc_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found"
        )
    
    return KYCResponse.from_orm(kyc_record)

@router.put("/test-admin/{kyc_id}/approve")
async def approve_test_kyc(
    kyc_id: int,
    db: Session = Depends(get_db)
):
    """Approve KYC record (test endpoint without auth)"""
    
    # Get KYC record
    kyc_record = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).first()
    if not kyc_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found"
        )
    
    # Update KYC record
    kyc_record.status = "approved"
    kyc_record.compliance_status = "compliant"
    kyc_record.reviewed_at = datetime.utcnow()
    kyc_record.approved_at = datetime.utcnow()
    kyc_record.verified_by = "admin"  # Mock admin for testing
    
    # Update user status if user exists
    user = db.query(User).filter(User.id == kyc_record.user_id).first()
    if user:
        user.kyc_status = "approved"
        user.is_verified = True
        user.kyc_jurisdiction = kyc_record.jurisdiction
        if kyc_record.prospera_permit_id:
            user.prospera_permit_id = kyc_record.prospera_permit_id
    
    db.commit()
    
    return {"message": "KYC approved successfully", "kyc_id": kyc_id}

@router.put("/test-admin/{kyc_id}/reject")
async def reject_test_kyc(
    kyc_id: int,
    reason: str,
    db: Session = Depends(get_db)
):
    """Reject KYC record (test endpoint without auth)"""
    
    # Get KYC record
    kyc_record = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).first()
    if not kyc_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found"
        )
    
    # Update KYC record
    kyc_record.status = "rejected"
    kyc_record.compliance_status = "non_compliant"
    kyc_record.reviewed_at = datetime.utcnow()
    kyc_record.verified_by = "admin"  # Mock admin for testing
    kyc_record.verification_notes = reason
    
    # Update user status if user exists
    user = db.query(User).filter(User.id == kyc_record.user_id).first()
    if user:
        user.kyc_status = "rejected"
    
    db.commit()
    
    return {"message": "KYC rejected", "kyc_id": kyc_id, "reason": reason}

@router.put("/admin/{kyc_id}/approve")
async def approve_kyc(
    kyc_id: int,
    db: Session = Depends(get_db)
):
    """Approve KYC record (admin only)"""
    
    # Get KYC record
    kyc_record = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).first()
    if not kyc_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found"
        )
    
    # Update KYC record
    kyc_record.status = "approved"
    kyc_record.compliance_status = "compliant"
    kyc_record.reviewed_at = datetime.utcnow()
    kyc_record.approved_at = datetime.utcnow()
    kyc_record.verified_by = "admin"  # Mock admin for testing
    
    # Update user status if user exists
    user = db.query(User).filter(User.id == kyc_record.user_id).first()
    if user:
        user.kyc_status = "approved"
        user.is_verified = True
        user.kyc_jurisdiction = kyc_record.jurisdiction
        if kyc_record.prospera_permit_id:
            user.prospera_permit_id = kyc_record.prospera_permit_id
    
    db.commit()
    
    return {"message": "KYC approved successfully", "kyc_id": kyc_id}

@router.put("/admin/{kyc_id}/reject")
async def reject_kyc(
    kyc_id: int,
    reason: str,
    db: Session = Depends(get_db)
):
    """Reject KYC record (admin only)"""
    
    # Get KYC record
    kyc_record = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).first()
    if not kyc_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found"
        )
    
    # Update KYC record
    kyc_record.status = "rejected"
    kyc_record.compliance_status = "non_compliant"
    kyc_record.reviewed_at = datetime.utcnow()
    kyc_record.verified_by = "admin"  # Mock admin for testing
    kyc_record.verification_notes = reason
    
    # Update user status if user exists
    user = db.query(User).filter(User.id == kyc_record.user_id).first()
    if user:
        user.kyc_status = "rejected"
    
    db.commit()
    
    return {"message": "KYC rejected", "kyc_id": kyc_id, "reason": reason} 