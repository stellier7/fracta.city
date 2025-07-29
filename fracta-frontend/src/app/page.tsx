'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import PropertyCard from '@/components/PropertyCard';
import KYCBanner from '@/components/KYCBanner';
import BlockchainStatus from '@/components/BlockchainStatus';
import { useLiveProperties } from '../../hooks/useBlockchain';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { properties, loading } = useLiveProperties();

  return (
    <main className="min-h-screen bg-bg-primary pt-16">
      {/* Global Header */}
      <Header />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <Features />
      
      {/* Property Listings Section */}
      <section className="py-24 bg-gradient-to-br from-bg-card to-bg-card-dark relative overflow-hidden">
        {/* Enhanced background patterns */}
        <div className="absolute inset-0 bg-gradient-overlay opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-overlay opacity-15 transform rotate-12" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-overlay opacity-15 transform -rotate-12" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Enhanced Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Featured{' '}
              <span className="text-accent-primary">
                Properties
              </span>
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Discover premium real estate investment opportunities in Prospera ZEDE, Honduras&apos; innovative economic zone
            </p>
          </div>

          {/* Enhanced KYC Information Banners */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <KYCBanner jurisdiction="prospera" />
            <KYCBanner jurisdiction="international" />
          </div>

          {/* Blockchain Status (for testing) */}
          <div className="mb-16">
            <h3 className="text-xl font-semibold text-text-primary mb-4">Blockchain Status</h3>
            <BlockchainStatus />
          </div>

          {/* Property Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
                <span className="ml-2 text-text-muted">Loading properties from blockchain...</span>
              </div>
            ) : (
              properties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  id={property.id}
                  name={property.name}
                  location={property.location}
                  jurisdiction={property.jurisdiction as 'prospera' | 'international'}
                  fullPrice={property.fullPrice}
                  tokenPrice={property.tokenPrice}
                  expectedYield={property.expectedYield}
                  image={property.image}
                  kycRequired={property.kycRequired as 'prospera-permit' | 'international-kyc'}
                  status={property.status as 'live' | 'coming-soon' | 'sold-out'}
                />
              ))
            )}
          </div>

          {/* Enhanced View All Properties CTA */}
          <div className="text-center mt-20">
            <div className="bg-gradient-card rounded-2xl p-8 border border-white/5 relative overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 max-w-4xl mx-auto">
              {/* CTA background patterns */}
              <div className="absolute inset-0 bg-gradient-overlay opacity-10" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-overlay opacity-15 transform rotate-45" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-overlay opacity-15 transform -rotate-45" />
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-text-primary mb-4">
                  Explore More{' '}
                  <span className="text-accent-primary">Investment Opportunities</span>
                </h3>
                <p className="text-text-secondary mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                  Browse our complete portfolio of tokenized real estate properties across Prospera ZEDE
                </p>
                <Link href="/marketplace" className="inline-block">
                  <button className="bg-gradient-primary hover:shadow-button text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-2 hover:shadow-glow">
                    View Marketplace
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-24 bg-bg-primary text-white relative overflow-hidden">
        {/* Enhanced background patterns */}
        <div className="absolute inset-0 bg-gradient-overlay opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-overlay opacity-15 transform rotate-45" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-overlay opacity-15 transform -rotate-45" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-text-primary">
              Trusted by Investors{' '}
              <span className="text-accent-primary">
                Worldwide
              </span>
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Join a growing community of investors earning passive income through blockchain-secured real estate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-gradient-card rounded-xl p-8 border border-white/5 shadow-card hover:shadow-card-hover hover:border-accent-primary/30 transition-all duration-300 ease-smooth transform hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="text-4xl font-bold text-accent-primary mb-2">$2.5M+</div>
                <div className="text-text-muted group-hover:text-text-secondary transition-colors duration-300">Total Value Locked</div>
              </div>
            </div>
            <div className="text-center bg-gradient-card rounded-xl p-8 border border-white/5 shadow-card hover:shadow-card-hover hover:border-success/30 transition-all duration-300 ease-smooth transform hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="text-4xl font-bold text-success mb-2">8.2%</div>
                <div className="text-text-muted group-hover:text-text-secondary transition-colors duration-300">Average Annual ROI</div>
              </div>
            </div>
            <div className="text-center bg-gradient-card rounded-xl p-8 border border-white/5 shadow-card hover:shadow-card-hover hover:border-accent-secondary/30 transition-all duration-300 ease-smooth transform hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute inset-0 bg-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="text-4xl font-bold text-accent-secondary mb-2">127+</div>
                <div className="text-text-muted group-hover:text-text-secondary transition-colors duration-300">Active Investors</div>
              </div>
            </div>
            <div className="text-center bg-gradient-card rounded-xl p-8 border border-white/5 shadow-card hover:shadow-card-hover hover:border-accent-primary/30 transition-all duration-300 ease-smooth transform hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="text-4xl font-bold text-accent-primary mb-2">15</div>
                <div className="text-text-muted group-hover:text-text-secondary transition-colors duration-300">Properties Listed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-card text-white py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded" />
                <span className="text-2xl font-bold text-text-primary">Fracta.city</span>
              </div>
              <p className="text-text-secondary mb-4 max-w-md leading-relaxed">
                Democratizing real estate investment through blockchain technology and fractional ownership in Prospera ZEDE.
              </p>
              <div className="text-sm text-text-muted">
                © 2024 Fracta.city. All rights reserved.
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-text-primary">Platform</h4>
              <ul className="space-y-2 text-text-secondary">
                <li><a href="#" className="hover:text-accent-primary transition-colors duration-300">Browse Properties</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors duration-300">How It Works</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors duration-300">Investor Dashboard</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors duration-300">Secondary Market</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-text-primary">Legal</h4>
              <ul className="space-y-2 text-text-secondary">
                <li><a href="#" className="hover:text-accent-primary transition-colors duration-300">Terms of Service</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors duration-300">Risk Disclosure</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors duration-300">Compliance</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
