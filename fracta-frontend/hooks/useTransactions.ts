/**
 * Transaction hooks for Fracta.city
 * Uses wagmi v2 for blockchain transactions
 */

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { useAccount } from 'wagmi';

// Contract addresses from deployment
const PROPERTY_TOKEN_ADDRESS = '0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b';

export interface PurchaseTokensParams {
  tokenAmount: number;
  propertyId: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  receipt?: any;
}

export interface PurchaseResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  tokensPurchased?: number;
}

export function usePurchaseTokens() {
  const { address } = useAccount();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<PurchaseResult | null>(null);

  const purchaseTokens = async (params: PurchaseTokensParams): Promise<PurchaseResult> => {
    if (!address) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    try {
      setIsPurchasing(true);
      setLastTransaction(null);

      const { tokenAmount, propertyId } = params;
      
      console.log(`Purchasing ${tokenAmount} tokens for property ${propertyId}`);
      
      // Call the backend API instead of direct blockchain
      const response = await fetch('http://localhost:8000/api/v1/transactions/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: parseInt(propertyId),
          token_amount: tokenAmount
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        const purchaseResult: PurchaseResult = {
          success: true,
          transactionHash: result.transaction_hash,
          tokensPurchased: result.tokens_purchased
        };
        
        setLastTransaction(purchaseResult);
        return purchaseResult;
      } else {
        const errorResult: PurchaseResult = {
          success: false,
          error: result.detail || result.error || 'Purchase failed'
        };
        
        setLastTransaction(errorResult);
        return errorResult;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error purchasing tokens:', error);
      
      const result: PurchaseResult = {
        success: false,
        error: errorMessage
      };

      setLastTransaction(result);
      return result;
    } finally {
      setIsPurchasing(false);
    }
  };

  return {
    purchaseTokens,
    isPurchasing,
    error: null,
    lastTransaction
  };
}

export function useTransactionStatus(hash?: string) {
  const { data: receipt, isPending, error } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}`,
    chainId: baseSepolia.id
  });

  const status: TransactionStatus = {
    hash: hash || '',
    status: isPending ? 'pending' : receipt?.status === 'success' ? 'success' : 'failed',
    error: error?.message,
    receipt
  };

  return status;
}

export function useGasEstimate() {
  const publicClient = usePublicClient({ chainId: baseSepolia.id });
  const [gasEstimate, setGasEstimate] = useState<bigint | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const estimateGas = async (tokenAmount: number): Promise<bigint> => {
    try {
      setIsEstimating(true);
      
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      
      const amountInWei = parseEther(tokenAmount.toString());
      
      const estimate = await publicClient.estimateContractGas({
        address: PROPERTY_TOKEN_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'purchaseTokens',
            type: 'function',
            stateMutability: 'payable',
            inputs: [
              {
                name: 'tokenAmount',
                type: 'uint256'
              }
            ],
            outputs: [],
            payable: true
          }
        ],
        functionName: 'purchaseTokens',
        args: [amountInWei],
        value: amountInWei
      });

      setGasEstimate(estimate);
      return estimate;
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    } finally {
      setIsEstimating(false);
    }
  };

  return {
    estimateGas,
    gasEstimate,
    isEstimating
  };
} 