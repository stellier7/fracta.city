/**
 * Blockchain service for Fracta.city frontend
 * Connects to backend API for real-time contract data
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface BlockchainProperty {
  id: string;
  name: string;
  location: string;
  jurisdiction: string;
  fullPrice: number;
  tokenPrice: number;
  totalTokens: number;
  tokensSold: number;
  tokensRemaining: number;
  expectedYield: number;
  image: string;
  kycRequired: string;
  status: string;
  contractAddress?: string;
  saleActive?: boolean;
  saleStartTime?: number;
  saleEndTime?: number;
}

export interface NetworkInfo {
  chain_id: number;
  network_name: string;
  connected: boolean;
  latest_block?: number;
  compliance_manager?: string;
  duna_studio_token?: string;
}

export interface UserKYCStatus {
  kyc_valid: boolean;
  jurisdiction: string;
  expiry: number;
  has_prospera_permit: boolean;
  permit_id: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  network?: NetworkInfo;
}

class BlockchainService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/v1/properties/blockchain`;
  }

  /**
   * Get real-time Duna Studio property data from blockchain
   */
  async getDunaStudioProperty(): Promise<BlockchainProperty | null> {
    try {
      const response = await fetch(`${this.baseUrl}/duna-studio`);
      const result: ApiResponse<BlockchainProperty> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        console.warn('Failed to fetch Duna Studio data from blockchain:', result.error);
        // Return fallback data if available
        return result.data || null;
      }
    } catch (error) {
      console.error('Error fetching Duna Studio property:', error);
      return null;
    }
  }

  /**
   * Get all live properties (blockchain + mock data)
   */
  async getAllLiveProperties(): Promise<BlockchainProperty[]> {
    try {
      const response = await fetch(`${this.baseUrl}/live-properties`);
      const result = await response.json();
      
      if (result.success && result.properties) {
        return result.properties;
      } else {
        console.warn('Failed to fetch live properties:', result.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching live properties:', error);
      return [];
    }
  }

  /**
   * Get blockchain network status
   */
  async getNetworkStatus(): Promise<NetworkInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/network-status`);
      const result: ApiResponse<NetworkInfo> = await response.json();
      
      if (result.success && result.network) {
        return result.network;
      } else {
        console.warn('Failed to fetch network status:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching network status:', error);
      return null;
    }
  }

  /**
   * Get user KYC status from blockchain
   */
  async getUserKYCStatus(walletAddress: string): Promise<UserKYCStatus | null> {
    try {
      if (!walletAddress || !this.isValidAddress(walletAddress)) {
        throw new Error('Invalid wallet address');
      }

      // For testing, return mock approved KYC for the user's wallet
      if (walletAddress.toLowerCase() === "0xdf7dc773d20827e4796cbeaff5113b4f9514be34") {
        return {
          kyc_valid: true,
          jurisdiction: "prospera",
          expiry: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year from now
          has_prospera_permit: true,
          permit_id: "TEST123"
        };
      }

      // Call the blockchain KYC endpoint
      const response = await fetch(`${API_BASE_URL}/api/v1/properties/blockchain/user/${walletAddress}/kyc`);

      if (!response.ok) {
        throw new Error(`KYC status request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.kyc_status) {
        return result.kyc_status;
      } else {
        console.warn('Failed to fetch KYC status:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      return null;
    }
  }

  /**
   * Get user token balance from blockchain
   */
  async getUserTokenBalance(walletAddress: string): Promise<number> {
    try {
      if (!walletAddress || !this.isValidAddress(walletAddress)) {
        throw new Error('Invalid wallet address');
      }

      const response = await fetch(`${this.baseUrl}/user/${walletAddress}/balance`);
      const result = await response.json();
      
      if (result.success) {
        return result.balance || 0;
      } else {
        console.warn('Failed to fetch token balance:', result.error);
        return 0;
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  }

  /**
   * Check if address is valid Ethereum address
   */
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format price with commas and currency
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Format large numbers with K/M suffixes
   */
  static formatTokenCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  /**
   * Calculate funding percentage
   */
  static calculateFundingPercentage(tokensSold: number, totalTokens: number): number {
    if (totalTokens === 0) return 0;
    return Math.round((tokensSold / totalTokens) * 100);
  }

  /**
   * Get status badge color based on property status
   */
  static getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'live':
        return 'bg-green-500';
      case 'coming-soon':
        return 'bg-blue-500';
      case 'sold-out':
        return 'bg-gray-500';
      case 'inactive':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  }

  /**
   * Check if sale is currently active
   */
  static isSaleActive(property: BlockchainProperty): boolean {
    if (!property.saleActive) return false;
    
    const now = Date.now() / 1000; // Convert to Unix timestamp
    return (
      property.saleStartTime ? now >= property.saleStartTime : true
    ) && (
      property.saleEndTime ? now <= property.saleEndTime : true
    );
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

// Export individual functions for convenience
export const {
  formatPrice,
  formatTokenCount,
  calculateFundingPercentage,
  getStatusColor,
  isSaleActive
} = BlockchainService; 