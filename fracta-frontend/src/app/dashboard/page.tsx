'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Building, Settings, ArrowRight, Plus, Coins } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import KYCStatus from '@/components/KYCStatus';
import Header from '@/components/Header';

interface TokenHolding {
  propertyName: string;
  propertyAddress: string;
  tokenBalance: number;
  tokenPrice: number;
  totalValue: number;
  purchasePrice: number; // Price per token when purchased
  totalPurchaseValue: number; // Total amount paid for these tokens
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

  // Fetch user's token holdings from blockchain
  useEffect(() => {
    const fetchTokenHoldings = async () => {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch Duna Studio tokens
        const response = await fetch(`http://localhost:8000/api/v1/properties/blockchain/user/${address}/balance`);
        const result = await response.json();
        
                 if (result.success && result.balance > 0) {
           // Get property info
           const propertyResponse = await fetch('http://localhost:8000/api/v1/properties/blockchain/duna-studio');
           const propertyResult = await propertyResponse.json();
           
           if (propertyResult.success && propertyResult.data) {
             // Calculate purchase value based on what you actually paid
             // You purchased at ~0.0316 ETH per token, which is approximately $119 USD
             const purchasePricePerToken = 119; // USD per token when purchased
             const totalPurchaseValue = result.balance * purchasePricePerToken;
             
             const holding: TokenHolding = {
               propertyName: propertyResult.data.name,
               propertyAddress: '0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b',
               tokenBalance: result.balance,
               tokenPrice: propertyResult.data.tokenPrice, // Current market price
               totalValue: result.balance * propertyResult.data.tokenPrice, // Current market value
               purchasePrice: purchasePricePerToken, // What you paid per token
               totalPurchaseValue: totalPurchaseValue // Total amount you paid
             };
             
             setTokenHoldings([holding]);
             setTotalPortfolioValue(totalPurchaseValue); // Use purchase value for portfolio
           }
         }
      } catch (error) {
        console.error('Error fetching token holdings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenHoldings();
  }, [isConnected, address]);

  const investmentSummary = {
    totalInvested: totalPortfolioValue,
    totalProperties: tokenHoldings.length,
    portfolioValue: totalPortfolioValue,
    monthlyReturn: 8.5 // Expected yield from Duna Studio
  };

  return (
    <div className="min-h-screen bg-gradient-bg pt-16">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-300">Welcome back! Here's your investment overview.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Investment Summary Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-gray-300 text-sm mb-1">Total Invested</h3>
                  <p className="text-2xl font-bold text-white">${investmentSummary.totalInvested.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-green-500 text-sm">+{investmentSummary.monthlyReturn}%</span>
                  </div>
                  <h3 className="text-gray-300 text-sm mb-1">Portfolio Value</h3>
                  <p className="text-2xl font-bold text-white">${investmentSummary.portfolioValue.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-gray-300 text-sm mb-1">Properties</h3>
                  <p className="text-2xl font-bold text-white">{investmentSummary.totalProperties}</p>
                </div>

                <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-gray-300 text-sm mb-1">Monthly Return</h3>
                  <p className="text-2xl font-bold text-white">{investmentSummary.monthlyReturn}%</p>
                </div>
              </div>

              {/* Token Holdings */}
              <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Your Token Holdings</h2>
                  <Link 
                    href="/marketplace"
                    className="text-accent-primary hover:text-accent-primary/80 transition-colors text-sm"
                  >
                    Buy More
                    <ArrowRight className="w-4 h-4 ml-1 inline" />
                  </Link>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
                    <p className="text-gray-300 mt-2">Loading your tokens...</p>
                  </div>
                ) : tokenHoldings.length > 0 ? (
                  <div className="space-y-4">
                    {tokenHoldings.map((holding, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Coins className="w-5 h-5 text-white" />
                          </div>
                                                     <div>
                             <h3 className="text-white font-semibold">{holding.propertyName}</h3>
                             <p className="text-gray-300 text-sm">
                               {holding.tokenBalance} tokens • Purchased at ${holding.purchasePrice}/token
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-white font-semibold">${holding.totalPurchaseValue.toLocaleString()}</p>
                           <p className="text-xs text-gray-400">
                             Paid ${holding.totalPurchaseValue.toLocaleString()} • Worth ${holding.totalValue.toLocaleString()}
                           </p>
                           <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                             Active
                           </span>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-accent-primary" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">No tokens yet</h3>
                    <p className="text-gray-300 mb-6">Start your investment journey by purchasing tokens</p>
                    <Link
                      href="/marketplace"
                      className="inline-flex items-center bg-gradient-primary hover:shadow-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                    >
                      Browse Properties
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* KYC Status */}
              <KYCStatus />

              {/* Quick Actions */}
              <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/marketplace"
                    className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-accent-primary" />
                      <span className="text-white">Browse Properties</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  
                  <Link
                    href="/kyc"
                    className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-accent-primary" />
                      <span className="text-white">KYC Verification</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  
                  <Link
                    href="/profile"
                    className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-accent-primary" />
                      <span className="text-white">Account Settings</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* Support */}
              <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Have questions about your investments or need assistance with KYC verification?
                </p>
                <Link
                  href="/support"
                  className="inline-flex items-center bg-gradient-primary hover:shadow-button text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 