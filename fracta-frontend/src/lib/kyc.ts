const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface KYCSubmission {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  kycType: 'prospera-permit' | 'international-kyc';
  jurisdiction: 'prospera' | 'international';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents?: {
    front?: string;
    back?: string;
    faceScan?: string;
  };
  personalInfo?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    permitNumber?: string;
  };
}

export interface ProsperaKYCData {
  prospera_permit_id: string;
  prospera_permit_type: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  permitImage?: File;
}

export interface InternationalKYCData {
  document_type: string;
  document_number: string;
  document_country: string;
  document_expiry: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  country_of_residence: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province?: string;
  postal_code: string;
  address_country: string;
  documents?: {
    front?: string;
    back?: string;
    faceScan?: string;
  };
}

export class KYCService {
  static async submitProsperaKYC(data: ProsperaKYCData): Promise<any> {
    console.log('Submitting Prospera KYC:', data);
    
    const response = await fetch(`${API_BASE_URL}/kyc/test-prospera-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prospera_permit_id: data.prospera_permit_id,
        prospera_permit_type: data.prospera_permit_type,
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        nationality: data.nationality
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`KYC submission failed: ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
  }

  static async submitInternationalKYC(data: InternationalKYCData): Promise<any> {
    console.log('Submitting International KYC:', data);
    
    const response = await fetch(`${API_BASE_URL}/kyc/international-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`KYC submission failed: ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
  }

  static async getKYCStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/kyc/status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get KYC status: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async getKYCRecords(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/kyc/records`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get KYC records: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Admin endpoints
  static async getAdminKYCSubmissions(filters?: {
    status?: string;
    jurisdiction?: string;
  }): Promise<KYCSubmission[]> {
    console.log('Getting admin KYC submissions with filters:', filters);
    
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') {
      params.append('status_filter', filters.status);
    }
    if (filters?.jurisdiction && filters.jurisdiction !== 'all') {
      params.append('jurisdiction_filter', filters.jurisdiction);
    }
    
    const response = await fetch(`${API_BASE_URL}/kyc/test-admin/all?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get admin KYC submissions: ${response.statusText}`);
    }
    
    const kycRecords = await response.json();
    
    // Transform backend format to frontend format
    return kycRecords.map((record: any) => ({
      id: record.id,
      userId: record.user_id,
      userEmail: 'user@example.com', // Mock email since we don't have user data
      userName: `${record.first_name} ${record.last_name}`,
      kycType: record.kyc_type,
      jurisdiction: record.jurisdiction,
      status: record.status,
      submittedAt: record.submitted_at,
      personalInfo: {
        firstName: record.first_name,
        lastName: record.last_name,
        dateOfBirth: record.date_of_birth,
        nationality: 'Honduran', // Mock nationality
        permitNumber: record.prospera_permit_id
      }
    }));
  }

  static async approveKYC(kycId: number): Promise<any> {
    console.log('Approving KYC:', kycId);
    
    const response = await fetch(`${API_BASE_URL}/kyc/test-admin/${kycId}/approve`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to approve KYC: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async rejectKYC(kycId: number, reason: string): Promise<any> {
    console.log('Rejecting KYC:', kycId, 'with reason:', reason);
    
    const response = await fetch(`${API_BASE_URL}/kyc/test-admin/${kycId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to reject KYC: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async getKYCSubmissionDetails(kycId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/kyc/admin/${kycId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get KYC details: ${response.statusText}`);
    }
    
    return response.json();
  }
} 