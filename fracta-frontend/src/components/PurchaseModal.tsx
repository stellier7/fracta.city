'use client';

import React, { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import { usePurchaseTokens, useGasEstimate } from '../../hooks/useTransactions';
import { useCanInvest } from '../../hooks/useBlockchain';
import { BlockchainProperty } from '../../lib/blockchain';

interface PurchaseModalProps {
  property: BlockchainProperty;
  isOpen: boolean;
  onClose: () => void;
}

export default function PurchaseModal({ property, isOpen, onClose }: PurchaseModalProps) {
  const [tokenAmount, setTokenAmount] = useState(1);
  const [step, setStep] = useState<'input' | 'confirming' | 'success' | 'error'>('input');
  
  const { purchaseTokens, isPurchasing, error, lastTransaction } = usePurchaseTokens();
  const { estimateGas, isEstimating } = useGasEstimate();
  const { canInvest, reason } = useCanInvest(property);

  const handlePurchase = async () => {
    if (!canInvest) {
      return;
    }

    setStep('confirming');
    
    try {
      const result = await purchaseTokens({
        tokenAmount,
        propertyId: property.id
      });

      if (result.success) {
        setStep('success');
      } else {
        setStep('error');
      }
    } catch (error) {
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('input');
    setTokenAmount(1);
    onClose();
  };

  const totalCost = tokenAmount * property.tokenPrice;
  const maxTokens = Math.min(property.tokensRemaining, 10); // Limit to 10 tokens for testing

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative bg-gradient-card rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Purchase Tokens</h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Property Info */}
        <div className="mb-6 p-4 bg-bg-primary/30 rounded-lg border border-white/5">
          <h3 className="text-lg font-semibold text-text-primary mb-2">{property.name}</h3>
          <div className="flex items-center justify-between text-sm text-text-muted">
            <span>Token Price: ${property.tokenPrice}</span>
            <span>Available: {property.tokensRemaining} tokens</span>
          </div>
        </div>

        {/* Content based on step */}
        {step === 'input' && (
          <>
            {/* KYC Check */}
            {!canInvest && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <span className="text-red-400 font-medium">{reason}</span>
                </div>
              </div>
            )}

            {/* Token Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Number of Tokens
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max={maxTokens}
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(Number(e.target.value))}
                  className="flex-1 px-4 py-3 bg-bg-primary/80 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none text-text-primary"
                  disabled={!canInvest}
                />
                <span className="text-text-muted text-sm">max {maxTokens}</span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mb-6 p-4 bg-bg-primary/30 rounded-lg border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-muted">Token Price</span>
                <span className="text-text-primary">${property.tokenPrice}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-muted">Quantity</span>
                <span className="text-text-primary">{tokenAmount}</span>
              </div>
              <div className="border-t border-white/10 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-text-primary">Total Cost</span>
                  <span className="text-xl font-bold text-accent-primary">${totalCost}</span>
                </div>
              </div>
            </div>

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={!canInvest || isPurchasing || isEstimating}
              className="w-full bg-gradient-primary hover:shadow-button text-white py-4 rounded-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  <span>Purchase {tokenAmount} Token{tokenAmount > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </>
        )}

        {step === 'confirming' && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-accent-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">Processing Transaction</h3>
            <p className="text-text-muted">Please wait while we process your purchase...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">Purchase Successful!</h3>
            <p className="text-text-muted mb-6">
              You have successfully purchased {tokenAmount} token{tokenAmount > 1 ? 's' : ''} for {property.name}.
            </p>
            <button
              onClick={handleClose}
              className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
            >
              Close
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">Transaction Failed</h3>
            <p className="text-text-muted mb-6">
              {error?.message || 'There was an error processing your transaction. Please try again.'}
            </p>
            <button
              onClick={() => setStep('input')}
              className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 