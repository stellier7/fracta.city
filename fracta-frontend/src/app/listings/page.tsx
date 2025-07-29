'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MapPin, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import PropertyCard from '@/components/PropertyCard';
import KYCBanner from '@/components/KYCBanner';
import { PropertyCardProps } from '@/data/mockProperties';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLiveProperties } from '../../../hooks/useBlockchain';
import { BlockchainProperty } from '../../../lib/blockchain';

export default function ListingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<'all' | 'prospera' | 'international'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'coming-soon' | 'sold-out'>('all');
  const [sortBy, setSortBy] = useState<'yield' | 'price' | 'name'>('yield');
  const [showFilters, setShowFilters] = useState(false);

  // Get blockchain properties
  const { properties: blockchainProperties, loading, error } = useLiveProperties();

  // Convert blockchain properties to PropertyCardProps format
  const allProperties: PropertyCardProps[] = useMemo(() => 
    blockchainProperties.map((prop: BlockchainProperty) => ({
      id: prop.id,
      name: prop.name,
      location: prop.location,
      jurisdiction: prop.jurisdiction as 'prospera' | 'international',
      fullPrice: prop.fullPrice,
      tokenPrice: prop.tokenPrice,
      expectedYield: prop.expectedYield,
      image: prop.image,
      kycRequired: prop.kycRequired as 'prospera-permit' | 'international-kyc',
      status: prop.status as 'live' | 'coming-soon' | 'sold-out'
    })), [blockchainProperties]);

  // Filter and search logic
  const filteredProperties = useMemo(() => {
    let filtered = allProperties;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Jurisdiction filter
    if (jurisdictionFilter !== 'all') {
      filtered = filtered.filter(property => property.jurisdiction === jurisdictionFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'yield':
          return b.expectedYield - a.expectedYield;
        case 'price':
          return a.tokenPrice - b.tokenPrice;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, jurisdictionFilter, statusFilter, sortBy, allProperties]);

  const getStatusCount = (status: string) => {
    return allProperties.filter(p => status === 'all' || p.status === status).length;
  };

  const getJurisdictionCount = (jurisdiction: string) => {
    return allProperties.filter(p => jurisdiction === 'all' || p.jurisdiction === jurisdiction).length;
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-16">
      {/* Enhanced Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Property{' '}
            <span className="text-accent-primary">
              Listings
            </span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl leading-relaxed">
            Explore all available tokenized real estate investment opportunities in Prospera ZEDE
          </p>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-gradient-card rounded-xl shadow-card border border-white/5 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search properties by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-bg-primary/80 backdrop-blur-glass border border-white/10 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none text-text-primary placeholder-text-muted/70"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-bg-primary/60 backdrop-blur-glass hover:bg-bg-primary/80 rounded-lg transition-all duration-300 ease-smooth border border-white/10 hover:border-accent-primary/50"
            >
              <SlidersHorizontal className="h-4 w-4 text-accent-primary" />
              <span className="text-text-primary">Filters</span>
            </button>
            <div className="text-sm text-text-secondary">
              <span className="text-accent-primary font-medium">{filteredProperties.length}</span> of {allProperties.length} properties
            </div>
          </div>

          {/* Enhanced Filters */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
              {/* Jurisdiction Filter */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Jurisdiction</label>
                <select
                  value={jurisdictionFilter}
                  onChange={(e) => setJurisdictionFilter(e.target.value as 'all' | 'prospera' | 'international')}
                  className="w-full px-3 py-2 bg-bg-primary/80 backdrop-blur-glass border border-white/10 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none text-text-primary"
                >
                  <option value="all">All ({getJurisdictionCount('all')})</option>
                  <option value="prospera">Prospera Only ({getJurisdictionCount('prospera')})</option>
                  <option value="international">International ({getJurisdictionCount('international')})</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'live' | 'coming-soon' | 'sold-out')}
                  className="w-full px-3 py-2 bg-bg-primary/80 backdrop-blur-glass border border-white/10 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none text-text-primary"
                >
                  <option value="all">All ({getStatusCount('all')})</option>
                  <option value="live">Live ({getStatusCount('live')})</option>
                  <option value="coming-soon">Coming Soon ({getStatusCount('coming-soon')})</option>
                  <option value="sold-out">Sold Out ({getStatusCount('sold-out')})</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'yield' | 'price' | 'name')}
                  className="w-full px-3 py-2 bg-bg-primary/80 backdrop-blur-glass border border-white/10 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none text-text-primary"
                >
                  <option value="yield">Expected Yield (High to Low)</option>
                  <option value="price">Token Price (Low to High)</option>
                  <option value="name">Property Name (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* KYC Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <KYCBanner jurisdiction="prospera" />
          <KYCBanner jurisdiction="international" />
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="bg-gradient-card rounded-2xl p-12 border border-white/5 shadow-card max-w-lg mx-auto">
              <Loader2 className="h-12 w-12 animate-spin text-accent-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">Loading Properties</h3>
              <p className="text-text-muted">Fetching real-time data from blockchain...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-gradient-card rounded-2xl p-12 border border-red-500/20 shadow-card max-w-lg mx-auto">
              <h3 className="text-xl font-semibold text-red-400 mb-2">Failed to Load Properties</h3>
              <p className="text-text-muted mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-accent-primary hover:bg-accent-primary/80 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProperties.map(property => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gradient-card rounded-2xl p-12 border border-white/5 shadow-card max-w-lg mx-auto">
              <MapPin className="h-16 w-16 text-text-muted/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No properties found</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Try adjusting your search terms or filters to find more properties.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setJurisdictionFilter('all');
                  setStatusFilter('all');
                }}
                className="bg-gradient-primary hover:shadow-button text-white px-6 py-3 rounded-lg transition-all duration-300 ease-smooth transform hover:-translate-y-1"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Pagination */}
        {filteredProperties.length > 0 && (
          <div className="flex justify-center mt-16">
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-gradient-card border border-white/10 rounded-lg text-text-secondary hover:bg-bg-card hover:border-accent-primary/50 transition-all duration-300 ease-smooth">
                Previous
              </button>
              <span className="px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium shadow-button">1</span>
              <button className="px-4 py-2 bg-gradient-card border border-white/10 rounded-lg text-text-secondary hover:bg-bg-card hover:border-accent-primary/50 transition-all duration-300 ease-smooth">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 