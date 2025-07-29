'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  MapPin, 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  ArrowLeft,
  ShoppingCart,
  Wallet,
  Percent,
  Shield,
  Clock,
  Heart,
  Share2,
  Copy
} from 'lucide-react';
import Header from '@/components/Header';
import { useLiveProperties } from '../../../../../../hooks/useBlockchain';
import { BlockchainProperty } from '../../../../../../lib/blockchain';

export default function TokenDetailPage() {
  const params = useParams();
  const propertyId = params['property-id'] as string;
  const tokenId = params['token-id'] as string;
  
  const { properties, loading, error } = useLiveProperties();
  
  const [isLiked, setIsLiked] = useState(false);

  // Find the specific property
  const property = useMemo(() => {
    return properties.find(p => p.id === propertyId);
  }, [properties, propertyId]);

  // Mock token data
  const tokenData = useMemo(() => {
    const basePrice = property?.tokenPrice || 119;
    const priceVariations = {
      '1234': { price: 125, change: -5.8, owner: '0x1234...5678' },
      '5678': { price: 135, change: 13.4, owner: '0x5678...9012' },
      '9012': { price: 118, change: -0.8, owner: '0x9012...3456' },
      '3456': { price: 142, change: 19.3, owner: '0x3456...7890' }
    };
    
    return priceVariations[tokenId as keyof typeof priceVariations] || {
      price: basePrice,
      change: 0,
      owner: '0x0000...0000'
    };
  }, [property, tokenId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-700 rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Token Not Found</h1>
            <p className="text-text-muted">The token you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Global Header */}
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-text-muted hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Property</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Image */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={property.image}
                alt={`${property.name} #${tokenId}`}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  For Sale
                </span>
              </div>
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full ${isLiked ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-text-muted'} hover:bg-white/20 transition-colors`}
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full bg-white/10 text-text-muted hover:bg-white/20 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full bg-white/10 text-text-muted hover:bg-white/20 transition-colors">
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Token Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-text-primary">{property.name} #{tokenId}</h1>
              <div className="flex items-center space-x-2 text-text-muted">
                <span>{property.name}</span>
                <Shield className="h-4 w-4 text-green-400" />
                <span>Verified</span>
              </div>
              <div className="text-text-muted">Owned by {tokenData.owner}</div>
            </div>

            {/* Pricing Info */}
            <div className="bg-gradient-card border border-white/5 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">TOP OFFER</span>
                  <span className="text-lg font-semibold text-accent-primary">${(tokenData.price * 0.95).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">COLLECTION FLOOR</span>
                  <span className="text-lg font-semibold text-text-primary">${(property.tokenPrice * 1.15).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">LAST SALE</span>
                  <span className="text-lg font-semibold text-text-primary">${(tokenData.price * 0.98).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Buy Section */}
            <div className="bg-gradient-card border border-white/5 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">BUY FOR</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent-primary">${tokenData.price.toFixed(2)}</div>
                    <div className="text-sm text-text-muted">${(tokenData.price * 1.2).toFixed(2)} USD</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">ENDING IN 21 HOURS</span>
                </div>
                
                <div className="flex space-x-3">
                  <button className="flex-1 bg-gradient-primary hover:shadow-button text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1 hover:shadow-glow border border-accent-primary/20">
                    <ShoppingCart className="h-5 w-5 inline mr-2" />
                    Buy Now
                  </button>
                  <button className="flex-1 bg-white/10 text-text-primary py-4 px-6 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 ease-smooth transform hover:-translate-y-1">
                    Make Offer
                  </button>
                </div>
              </div>
            </div>

            {/* Token Traits */}
            <div className="bg-gradient-card border border-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Token Traits</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">PROPERTY</div>
                  <div className="text-sm font-medium text-text-primary">{property.name}</div>
                  <div className="text-xs text-text-muted">1 of 1,000</div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">LOCATION</div>
                  <div className="text-sm font-medium text-text-primary">{property.location}</div>
                  <div className="text-xs text-text-muted">1 of 1,000</div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">JURISDICTION</div>
                  <div className="text-sm font-medium text-text-primary">{property.jurisdiction}</div>
                  <div className="text-xs text-text-muted">1 of 1,000</div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">YIELD</div>
                  <div className="text-sm font-medium text-text-primary">{property.expectedYield}%</div>
                  <div className="text-xs text-text-muted">1 of 1,000</div>
                </div>
              </div>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-2">
              <div className="bg-gradient-card border border-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary font-medium">Price History</span>
                  <span className="text-text-muted">▼</span>
                </div>
              </div>
              
              <div className="bg-gradient-card border border-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary font-medium">About</span>
                  <span className="text-text-muted">▼</span>
                </div>
              </div>
              
              <div className="bg-gradient-card border border-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary font-medium">Blockchain Details</span>
                  <span className="text-text-muted">▼</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 