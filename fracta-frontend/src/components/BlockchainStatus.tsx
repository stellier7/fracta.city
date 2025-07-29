'use client';

import React from 'react';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { useNetworkStatus, useDunaStudioProperty } from '../../hooks/useBlockchain';
import { formatPrice } from '../../lib/blockchain';

export default function BlockchainStatus() {
  const { network, loading: networkLoading, error: networkError } = useNetworkStatus();
  const { property, loading: propertyLoading } = useDunaStudioProperty();

  if (networkLoading || propertyLoading) {
    return (
      <div className="bg-gradient-card border border-white/5 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-accent-primary" />
          <span className="text-sm text-text-muted">Connecting to blockchain...</span>
        </div>
      </div>
    );
  }

  if (networkError) {
    return (
      <div className="bg-gradient-card border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-400">Blockchain connection failed</span>
        </div>
        <p className="text-xs text-text-muted mt-1">{networkError}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-card border border-white/5 rounded-lg p-4">
      {/* Network Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {network?.connected ? (
            <Wifi className="h-4 w-4 text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
          <span className="text-sm font-medium text-text-primary">
            {network?.network_name || 'Base Testnet'}
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          network?.connected 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {network?.connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Chain Info */}
      <div className="text-xs text-text-muted mb-3">
        Chain ID: {network?.chain_id || 84532}
        {network?.latest_block && (
          <span className="ml-4">Block: {network.latest_block.toLocaleString()}</span>
        )}
      </div>

      {/* Duna Studio Property Info */}
      {property && (
        <div className="border-t border-white/5 pt-3">
          <h4 className="text-sm font-medium text-text-primary mb-2">
            {property.name}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-text-muted">Property Value:</span>
              <div className="font-medium text-accent-primary">
                {formatPrice(property.fullPrice)}
              </div>
            </div>
            <div>
              <span className="text-text-muted">Token Price:</span>
              <div className="font-medium text-accent-primary">
                ${property.tokenPrice}
              </div>
            </div>
            <div>
              <span className="text-text-muted">Tokens Sold:</span>
              <div className="font-medium text-success">
                {property.tokensSold.toLocaleString()} / {property.totalTokens.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-text-muted">Status:</span>
              <div className={`font-medium capitalize ${
                property.status === 'live' ? 'text-green-400' :
                property.status === 'coming-soon' ? 'text-blue-400' :
                'text-yellow-400'
              }`}>
                {property.status}
              </div>
            </div>
          </div>
          
          {property.contractAddress && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <span className="text-text-muted text-xs">Contract:</span>
              <div className="font-mono text-xs text-accent-secondary break-all">
                {property.contractAddress}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 