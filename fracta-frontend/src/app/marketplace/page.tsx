'use client';

import React, { useState, useMemo } from 'react';
import { Filter, TrendingUp, Building2, Users, DollarSign } from 'lucide-react';
import Header from '@/components/Header';
import { useLiveProperties } from '../../../hooks/useBlockchain';
import PropertyCard from '@/components/PropertyCard';

type Jurisdiction = 'all' | 'honduras' | 'prospera' | 'us';
type PropertyStatus = 'all' | 'active' | 'coming-soon' | 'sold-out';

export default function MarketplacePage() {
  const { properties, loading, error } = useLiveProperties();
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction>('all');
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate marketplace stats
  const stats = useMemo(() => {
    if (!properties.length) return null;

    const totalVolume = properties.reduce((sum, prop) => sum + (prop.tokensSold * prop.tokenPrice), 0);
    const activeProperties = properties.filter(p => p.status === 'live').length;
    const comingSoon = properties.filter(p => p.status === 'coming-soon').length;

    return {
      totalVolume,
      activeProperties,
      comingSoon,
      totalProperties: properties.length
    };
  }, [properties]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Jurisdiction filter
      if (selectedJurisdiction !== 'all') {
        const jurisdiction = property.jurisdiction.toLowerCase();
        if (selectedJurisdiction === 'honduras' && !jurisdiction.includes('honduras') && !jurisdiction.includes('roatan')) return false;
        if (selectedJurisdiction === 'prospera' && !jurisdiction.includes('prospera')) return false;
        if (selectedJurisdiction === 'us' && !jurisdiction.includes('us')) return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && property.status !== selectedStatus) return false;

      // Search filter
      if (searchQuery && !property.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  }, [properties, selectedJurisdiction, selectedStatus, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Marketplace Error</h1>
            <p className="text-text-muted">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg pt-16">
      {/* Global Header */}
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Marketplace</h1>
          <p className="text-text-muted">Discover and invest in tokenized real estate properties</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-card border border-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-accent-primary" />
                <span className="text-sm text-text-muted">Total Volume</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                ${stats.totalVolume.toLocaleString()}
              </div>
            </div>



            <div className="bg-gradient-card border border-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-text-muted">Properties</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {stats.totalProperties}
              </div>
            </div>

            <div className="bg-gradient-card border border-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-accent-primary" />
                <span className="text-sm text-text-muted">Active Sales</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {stats.activeProperties}
              </div>
            </div>

            <div className="bg-gradient-card border border-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-text-muted">Coming Soon</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {stats.comingSoon}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gradient-card border border-white/5 rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            {/* Jurisdiction Filter */}
            <div className="flex space-x-2">
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value as Jurisdiction)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="all">All Jurisdictions</option>
                <option value="honduras">Honduras</option>
                <option value="prospera">Prospera ZEDE</option>
                <option value="us">United States</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as PropertyStatus)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="all">All Status</option>
                <option value="live">Active Sales</option>
                <option value="coming-soon">Coming Soon</option>
                <option value="sold-out">Sold Out</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
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
          ))}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-text-muted mb-4">
              <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No properties found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 