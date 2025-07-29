'use client';

import React, { useState } from 'react';
import { MapPin, TrendingUp, Shield, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PropertyCardProps } from '../data/mockProperties';
import PurchaseModal from './PurchaseModal';
import { BlockchainProperty } from '../../lib/blockchain';

export default function PropertyCard(props: PropertyCardProps) {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const {
    name,
    location,
    fullPrice,
    tokenPrice,
    expectedYield,
    image,
    kycRequired,
    status
  } = props;

  const getStatusBadge = () => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-primary/20 text-accent-primary border border-accent-primary/30 backdrop-blur-glass">
            <div className="w-2 h-2 bg-accent-primary rounded-full mr-2 animate-pulse" />
            Live
          </span>
        );
      case 'coming-soon':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 backdrop-blur-glass">
            <Clock className="w-3 h-3 mr-1" />
            Coming Soon
          </span>
        );
      case 'sold-out':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-text-muted/20 text-text-muted border border-text-muted/30 backdrop-blur-glass">
            Sold Out
          </span>
        );
    }
  };

  const getKycBadge = () => {
    // Simplified KYC status - just show if verified or not
    const isVerified = true; // For now, assume verified since we have mock data
    
    if (isVerified) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          <Shield className="w-3 h-3 mr-1" />
          KYC Verified
        </span>
      );
    } else {
      return (
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/kyc';
          }}
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
        >
          <Shield className="w-3 h-3 mr-1" />
          KYC Required
        </button>
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isDisabled = status === 'sold-out';

  return (
    <>
      <Link href={`/marketplace/${props.id || 'property'}`} className="block">
        <div className="group bg-gradient-card rounded-xl shadow-card border border-white/5 overflow-hidden transition-all duration-300 ease-smooth transform hover:-translate-y-2 hover:shadow-card-hover hover:border-accent-primary/30 cursor-pointer">
        {/* Property Image with enhanced styling */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Hover overlay effect */}
          <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4 z-10">
            {getStatusBadge()}
          </div>
        </div>

        {/* Card Content with enhanced spacing */}
        <div className="p-6">
          {/* Property Name & Location */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-accent-primary transition-colors duration-300">
              {name}
            </h3>
            <div className="flex items-center text-text-muted text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {location}
            </div>
          </div>

          {/* KYC Requirement */}
          <div className="mb-4">
            {getKycBadge()}
          </div>

          {/* Property Value Display */}
          <div className="mb-4">
            <div className="bg-bg-primary/30 rounded-lg p-3 border border-white/5">
              <div className="text-sm text-text-muted mb-1">Property Value</div>
              <div className="text-xl font-bold text-text-primary">{formatPrice(fullPrice)}</div>
            </div>
          </div>

          {/* Financial Info with enhanced styling */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-bg-primary/30 rounded-lg p-3 border border-white/5">
              <div className="text-sm text-text-muted mb-1">Token Price</div>
              <div className="text-2xl font-bold text-accent-primary">${tokenPrice}</div>
            </div>
            <div className="bg-bg-primary/30 rounded-lg p-3 border border-white/5">
              <div className="text-sm text-text-muted mb-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Expected Yield
              </div>
              <div className="text-2xl font-bold text-success">{expectedYield}%</div>
            </div>
          </div>

          {/* Buy and Make Offer Buttons */}
          <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
                e.stopPropagation();
              if (status === 'live') {
                  window.location.href = `/marketplace/${props.id || 'duna-studio'}`;
              }
            }}
            disabled={isDisabled}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ease-smooth ${
              isDisabled 
                ? 'bg-text-muted/20 text-text-muted cursor-not-allowed border border-text-muted/20' 
                : 'bg-gradient-primary hover:shadow-button text-white transform hover:-translate-y-1 hover:shadow-glow border border-accent-primary/20'
            }`}
          >
            {status === 'sold-out' ? 'Sold Out' : status === 'coming-soon' ? 'Notify Me' : 'Buy Tokens'}
          </button>
            
            {status === 'live' && !isDisabled && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Implement make offer functionality
                  console.log('Make offer clicked');
                }}
                className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm bg-bg-primary/80 text-text-primary border border-white/10 hover:bg-bg-primary/60 transition-all duration-300 ease-smooth transform hover:-translate-y-1"
              >
                Make Offer
              </button>
            )}
          </div>
        </div>
      </div>
      </Link>
      
      {/* Purchase Modal */}
      <PurchaseModal
        property={{
          id: props.id || '1',
          name: props.name,
          location: props.location,
          jurisdiction: props.jurisdiction,
          fullPrice: props.fullPrice,
          tokenPrice: props.tokenPrice,
          totalTokens: 1000, // Mock data
          tokensSold: 500, // Mock data
          tokensRemaining: 500, // Mock data
          expectedYield: props.expectedYield,
          image: props.image,
          kycRequired: props.kycRequired,
          status: props.status
        }}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </>
  );
} 