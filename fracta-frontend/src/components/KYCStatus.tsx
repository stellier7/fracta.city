'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Globe, CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { KYCService } from '@/lib/kyc';

interface KYCStatus {
  hasKYC: boolean;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  kycJurisdiction?: 'prospera' | 'international';
  canInvestProspera: boolean;
  canInvestInternational: boolean;
  requiresRenewal: boolean;
  nextSteps: string[];
}

export default function KYCStatus() {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchKYCStatus = async () => {
      try {
        // For now, we'll check the admin endpoint to get the latest KYC status
        // In a real app, you'd have a user-specific endpoint
        const submissions = await KYCService.getAdminKYCSubmissions();
        
        if (submissions.length > 0) {
          // Get the latest submission (most recent)
          const latestSubmission = submissions[0];
          
          const kycStatus: KYCStatus = {
            hasKYC: true,
            kycStatus: latestSubmission.status as 'pending' | 'approved' | 'rejected',
            kycJurisdiction: latestSubmission.jurisdiction as 'prospera' | 'international',
            canInvestProspera: latestSubmission.status === 'approved' && latestSubmission.jurisdiction === 'prospera',
            canInvestInternational: latestSubmission.status === 'approved' && latestSubmission.jurisdiction === 'international',
            requiresRenewal: false,
            nextSteps: latestSubmission.status === 'approved' 
              ? ['You can now invest in properties!']
              : latestSubmission.status === 'pending'
              ? ['KYC verification is being reviewed', 'You will receive an update within 24-48 hours']
              : ['Please review the requirements and try again']
          };
          
          setKycStatus(kycStatus);
        } else {
          // No KYC submissions found
          setKycStatus({
            hasKYC: false,
            kycStatus: 'none',
            canInvestProspera: false,
            canInvestInternational: false,
            requiresRenewal: false,
            nextSteps: ['Complete identity verification to start investing']
          });
        }
      } catch (error) {
        console.error('Failed to fetch KYC status:', error);
        // Fallback to mock data
        setKycStatus({
          hasKYC: false,
          kycStatus: 'none',
          canInvestProspera: false,
          canInvestInternational: false,
          requiresRenewal: false,
          nextSteps: ['Complete identity verification to start investing']
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchKYCStatus();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded mb-4"></div>
          <div className="h-3 bg-gray-600 rounded mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!kycStatus) {
    return null;
  }

  const getStatusIcon = () => {
    switch (kycStatus.kycStatus) {
      case 'approved':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (kycStatus.kycStatus) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (kycStatus.kycStatus) {
      case 'approved':
        return 'Verification Complete';
      case 'rejected':
        return 'Verification Failed';
      case 'pending':
        return 'Under Review';
      default:
        return 'Not Verified';
    }
  };

  return (
    <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {kycStatus.kycJurisdiction === 'prospera' ? (
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">Identity Verification</h3>
            <p className="text-gray-300 text-sm">
              {kycStatus.kycJurisdiction === 'prospera' ? 'Prospera Resident' : 'International Investor'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-4">
        {kycStatus.kycStatus === 'approved' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-500 font-semibold">Verification Complete</span>
            </div>
            <p className="text-green-400 text-sm">
              You can now invest in {kycStatus.kycJurisdiction === 'prospera' ? 'Prospera' : 'international'} properties.
            </p>
          </div>
        )}

        {kycStatus.kycStatus === 'pending' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-yellow-500 font-semibold">Under Review</span>
            </div>
            <p className="text-yellow-400 text-sm">
              Your verification is being processed. This usually takes 24-48 hours.
            </p>
          </div>
        )}

        {kycStatus.kycStatus === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-500 font-semibold">Verification Failed</span>
            </div>
            <p className="text-red-400 text-sm">
              Your verification was not approved. Please review the requirements and try again.
            </p>
          </div>
        )}

        {!kycStatus.hasKYC && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-blue-500 font-semibold">Verification Required</span>
            </div>
            <p className="text-blue-400 text-sm">
              Complete identity verification to start investing in tokenized real estate.
            </p>
          </div>
        )}

        {/* Next Steps */}
        {kycStatus.nextSteps.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-2">Next Steps</h4>
            <ul className="space-y-1">
              {kycStatus.nextSteps.map((step, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap gap-3">
          {!kycStatus.hasKYC && (
            <Link
              href="/kyc"
              className="inline-flex items-center bg-gradient-primary hover:shadow-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
            >
              Start Verification
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
          
          {kycStatus.kycStatus === 'rejected' && (
            <Link
              href="/kyc"
              className="inline-flex items-center bg-gradient-secondary hover:shadow-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
            >
              Try Again
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
          
          {kycStatus.kycStatus === 'approved' && (
            <Link
              href="/marketplace"
              className="inline-flex items-center bg-gradient-primary hover:shadow-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
            >
              Browse Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
          
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="inline-flex items-center bg-black/20 border border-white/10 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-smooth transform hover:-translate-y-1"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
} 