'use client';

import React, { useState } from 'react';
import { Shield, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { KYCService, ProsperaKYCData } from '@/lib/kyc';
import Header from '@/components/Header';

export default function ProsperaKYCPage() {
  const [formData, setFormData] = useState({
    permitNumber: '',
    firstName: '',
    lastName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const kycData: ProsperaKYCData = {
        prospera_permit_id: formData.permitNumber,
        prospera_permit_type: 'resident', // Default to resident
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: new Date().toISOString().split('T')[0], // You might want to add a date picker
        nationality: 'Honduran', // You might want to add a nationality field
        permitImage: undefined // Removed permit upload
      };
      
      await KYCService.submitProsperaKYC(kycData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('KYC submission failed:', error);
      alert('KYC submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-card p-8 rounded-2xl border border-white/10">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Verification Submitted!
              </h2>
              <p className="text-gray-300 mb-8">
                Your Prospera permit verification has been submitted. You'll receive an update within 24 hours.
              </p>
              <Link 
                href="/marketplace"
                className="inline-flex items-center bg-gradient-primary hover:shadow-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg pt-16">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link 
              href="/kyc"
              className="inline-flex items-center text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Verification Options
            </Link>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Prospera Verification</h1>
                <p className="text-gray-300">Quick verification with your permit</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gradient-card p-8 rounded-2xl border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Permit Number */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Prospera Permit Number
                </label>
                <input
                  type="text"
                  value={formData.permitNumber}
                  onChange={(e) => setFormData({...formData, permitNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-accent-primary focus:outline-none transition-colors"
                  placeholder="Enter your permit number"
                  required
                />
              </div>



              {/* First Name */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-accent-primary focus:outline-none transition-colors"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-accent-primary focus:outline-none transition-colors"
                  placeholder="Enter your last name"
                  required
                />
              </div>

              

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-primary hover:shadow-button text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-smooth transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Submit Verification'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 