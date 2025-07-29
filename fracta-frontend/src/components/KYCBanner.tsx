'use client';

import React from 'react';
import { Shield, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface KYCBannerProps {
  jurisdiction: 'prospera' | 'international';
  className?: string;
}

export default function KYCBanner({ jurisdiction, className = '' }: KYCBannerProps) {
  if (jurisdiction === 'prospera') {
    return (
      <div className={`bg-gradient-card text-white p-8 rounded-xl border border-white/5 shadow-card hover:shadow-card-hover hover:border-accent-primary/30 transition-all duration-300 ease-smooth relative overflow-hidden ${className}`}>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-overlay opacity-10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-overlay opacity-15 transform rotate-45" />
        
        <div className="relative z-10 flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center shadow-button">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <AlertCircle className="w-5 h-5 text-accent-primary mr-2" />
              <h3 className="text-xl font-semibold text-text-primary">Prospera Residents Only</h3>
            </div>
            <p className="text-text-secondary mb-6 leading-relaxed">
              This property is exclusively available to Prospera ZEDE residents and permit holders. 
              You&apos;ll need to verify your Prospera residency status to participate in this investment opportunity.
            </p>
            <div className="bg-bg-primary/60 backdrop-blur-glass rounded-lg p-4 border border-white/5 mb-6">
              <div className="flex items-center mb-3">
                <CheckCircle2 className="w-4 h-4 text-accent-primary mr-2" />
                <span className="font-semibold text-text-primary text-sm">Required Documentation:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-text-secondary space-y-1 ml-6">
                <li>Valid Prospera residency permit</li>
                <li>Government-issued photo ID</li>
                <li>Proof of address within Prospera ZEDE</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/kyc/prospera" className="bg-gradient-primary hover:shadow-button text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1 text-center">
                Prospera Resident
              </Link>
              <a 
                href="https://portal.eprospera.com/en/residency" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-black/20 backdrop-blur-glass border border-white/10 hover:border-accent-primary/50 text-text-primary hover:bg-accent-primary/10 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1 text-center"
              >
                Become Prospera Resident
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-card text-white p-8 rounded-xl border border-white/5 shadow-card hover:shadow-card-hover hover:border-accent-secondary/30 transition-all duration-300 ease-smooth relative overflow-hidden ${className}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-overlay opacity-10" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-overlay opacity-15 transform rotate-45" />
      
      <div className="relative z-10 flex items-start space-x-6">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-button">
            <Globe className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <CheckCircle2 className="w-5 h-5 text-accent-secondary mr-2" />
            <h3 className="text-xl font-semibold text-text-primary">Open to Global Investors</h3>
          </div>
          <p className="text-text-secondary mb-6 leading-relaxed">
            This property is available to international investors worldwide. 
            Complete our streamlined KYC process to start investing in tokenized real estate.
          </p>
          <div className="bg-bg-primary/60 backdrop-blur-glass rounded-lg p-4 border border-white/5 mb-6">
            <div className="flex items-center mb-3">
              <CheckCircle2 className="w-4 h-4 text-accent-secondary mr-2" />
              <span className="font-semibold text-text-primary text-sm">Quick Verification Process:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-text-secondary space-y-1 ml-6">
              <li>Government-issued photo ID</li>
              <li>Proof of address (utility bill or bank statement)</li>
              <li>Source of funds declaration</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="bg-gradient-secondary hover:shadow-button text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1">
              Start Verification
            </button>
            <button className="bg-black/20 backdrop-blur-glass border border-white/10 hover:border-accent-secondary/50 text-text-primary hover:bg-accent-secondary/10 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1">
              Learn More About KYC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 