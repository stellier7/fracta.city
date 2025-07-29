'use client';

import React from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Building2, MapPin, TrendingUp, Shield, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useBlockchainStats, useDunaStudioProperty } from '../../hooks/useBlockchain';
import { formatPrice } from '../../lib/blockchain';

export default function Hero() {
  const { stats, loading: statsLoading } = useBlockchainStats();
  const { property: dunaStudio, loading: dunaLoading } = useDunaStudioProperty();

  return (
    <div className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Subtle overlay gradients for depth */}
      <div className="absolute inset-0 bg-gradient-overlay opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-overlay opacity-30 transform rotate-180" />

      {/* Hero content starts here - header is now global */}

      <div className="relative min-h-[90vh] flex items-center pb-40">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto px-6 py-12">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
                Invest in the Future of{' '}
                <span className="text-accent-primary">
                  Real Estate
                </span>
              </h1>
              
              <p className="text-xl text-text-secondary mb-8 leading-relaxed max-w-xl">
                Own fractional shares of premium properties in Prospera ZEDE. Start with just $100 and earn 6-12% annual returns through blockchain-secured real estate.
              </p>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/kyc" className="inline-block">
                  <button className="group bg-gradient-primary hover:shadow-button text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-2 hover:shadow-glow flex items-center justify-center space-x-2">
                    <span>Start Investing</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
                
                <Link href="/marketplace" className="inline-block">
                  <button className="group bg-black/20 backdrop-blur-glass border border-white/10 hover:border-accent-secondary/50 text-text-primary hover:bg-accent-secondary/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-2 flex items-center justify-center space-x-2">
                    <span>View Properties</span>
                    <Building2 className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Enhanced Stats Row with Real Data */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center bg-gradient-card p-4 rounded-lg border border-white/5 shadow-card">
                <div className="text-2xl md:text-3xl font-bold text-accent-primary mb-1">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    formatPrice(stats.totalValueLocked || 119000)
                  )}
                </div>
                <div className="text-sm text-text-muted">Total Invested</div>
              </div>
              <div className="text-center bg-gradient-card p-4 rounded-lg border border-white/5 shadow-card">
                <div className="text-2xl md:text-3xl font-bold text-success mb-1">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    '8.5%'
                  )}
                </div>
                <div className="text-sm text-text-muted">Expected ROI</div>
              </div>
              <div className="text-center bg-gradient-card p-4 rounded-lg border border-white/5 shadow-card">
                <div className="text-2xl md:text-3xl font-bold text-accent-secondary mb-1">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    `${stats.totalProperties || 4}+`
                  )}
                </div>
                <div className="text-sm text-text-muted">Properties</div>
              </div>
            </div>
          </div>

          {/* Right Column - Two Images Layout */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Main Property Image - 70% width with duna_tower_main.png - Moved lower */}
              <div className="relative w-full h-96 bg-gradient-card rounded-2xl shadow-card border border-white/5 overflow-hidden mt-8">
                <Image
                  src="/images/dunaResidences/duna_tower_main.png"
                  alt="Duna Residences Tower"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-text-primary font-semibold text-lg">Duna Residences</div>
                  <div className="text-text-muted">Roatán, Prospera ZEDE</div>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className="bg-accent-primary/20 text-accent-primary px-2 py-1 rounded text-sm font-medium">
                      Live
                    </span>
                    <span className="text-success font-semibold">8.5% ROI</span>
                  </div>
                </div>
              </div>

              {/* Accent Image - Pristine Bay Villa 1111 - Positioned at middle level */}
              <div className="absolute -bottom-8 -right-8 w-64 h-48 bg-gradient-card rounded-xl shadow-card-hover border-2 border-accent-primary/30 overflow-hidden z-20">
                <Image
                  src="/images/pristineBay/PB_1111_1.png"
                  alt="Pristine Bay Villa 1111"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-text-primary font-medium">Pristine Bay, Villa 1111</div>
                  <div className="text-text-muted text-sm">Coming Soon</div>
                </div>
              </div>

              {/* Enhanced Property Preview Card with Duna Residences Studio - With space to be fully visible */}
              <div className="absolute -bottom-32 left-4 bg-gradient-card/95 border border-white/10 rounded-xl p-6 shadow-card-hover backdrop-blur-md transform hover:scale-105 transition-all duration-300 ease-smooth max-w-xs z-10">
                {/* Small property image for the preview card */}
                <div className="relative w-full h-24 rounded-lg overflow-hidden mb-4">
                  <Image
                    src="/images/dunaResidences/duna_studio_birdsView.png"
                    alt="Duna Residences Studio - Birds Eye View"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-text-primary font-bold text-lg mb-1">Duna Residences, Studio</h3>
                    <div className="flex items-center text-text-muted text-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      Roatán, Prospera ZEDE
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${
                    dunaStudio?.status === 'live' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : dunaStudio?.status === 'coming-soon'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {dunaLoading ? '...' : (dunaStudio?.status || 'Live')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-text-muted text-xs mb-1">Token Price</div>
                    <div className="text-accent-primary font-bold text-xl">
                      {dunaLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        `$${dunaStudio?.tokenPrice || 119}`
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-muted text-xs mb-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Expected Yield
                    </div>
                    <div className="text-success font-bold text-xl">
                      {dunaLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        `${dunaStudio?.expectedYield || 8.5}%`
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-xs text-text-muted mb-2">
                    <Shield className="w-3 h-3 mr-1" />
                    Prospera Permit Required
                  </div>
                </div>

                <Link href="/marketplace/duna-studio" className="block">
                  <button className="w-full bg-gradient-primary hover:shadow-button text-white py-3 rounded-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1">
                    Buy Tokens
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 