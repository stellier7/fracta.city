'use client';

import React, { useState } from 'react';
import { Shield, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function KYCPage() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<'prospera' | 'international' | null>(null);

  return (
    <div className="min-h-screen bg-gradient-bg pt-16">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Identity Verification
            </h1>
            <p className="text-xl text-gray-300">
              Choose your verification method to start investing
            </p>
          </div>

          {/* Jurisdiction Selection */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Prospera Option */}
            <div 
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                selectedJurisdiction === 'prospera' 
                  ? 'border-accent-primary bg-gradient-card shadow-card-hover' 
                  : 'border-white/10 bg-gradient-card hover:border-accent-primary/50 hover:shadow-card'
              }`}
              onClick={() => setSelectedJurisdiction('prospera')}
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Prospera Resident</h3>
                  <p className="text-gray-300">Quick verification with permit</p>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-accent-primary mr-3" />
                  <span>Enter your Prospera permit number</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-accent-primary mr-3" />
                  <span>Provide your full name</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-accent-primary mr-3" />
                  <span>Instant verification</span>
                </div>
              </div>

              {selectedJurisdiction === 'prospera' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-8 h-8 text-accent-primary" />
                </div>
              )}
            </div>

            {/* International Option */}
            <div 
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                selectedJurisdiction === 'international' 
                  ? 'border-accent-secondary bg-gradient-card shadow-card-hover' 
                  : 'border-white/10 bg-gradient-card hover:border-accent-secondary/50 hover:shadow-card'
              }`}
              onClick={() => setSelectedJurisdiction('international')}
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-secondary rounded-xl flex items-center justify-center mr-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">International Investor</h3>
                  <p className="text-gray-300">Complete KYC verification</p>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-accent-secondary mr-3" />
                  <span>Document upload with camera</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-accent-secondary mr-3" />
                  <span>Face verification scan</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-accent-secondary mr-3" />
                  <span>24-48 hour review</span>
                </div>
              </div>

              {selectedJurisdiction === 'international' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-8 h-8 text-accent-secondary" />
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          {selectedJurisdiction && (
            <div className="text-center">
              <Link 
                href={`/kyc/${selectedJurisdiction}`}
                className="inline-flex items-center bg-gradient-primary hover:shadow-button text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-smooth transform hover:-translate-y-1"
              >
                Continue to Verification
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 