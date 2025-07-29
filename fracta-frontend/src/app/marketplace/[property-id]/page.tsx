"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Building2, TrendingUp, Wallet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { parseEther } from 'viem';
import Header from '@/components/Header';


interface Token {
  id: number;
  token_number: number;
  property_id: number;
  owner_id: number;
  mint_price: number;
  current_price?: number;
  is_for_sale: boolean;
  minted_at: string;
}

interface Property {
  id: string;
  name: string;
  location: string;
  jurisdiction: string;
  fullPrice: number;
  tokenPrice: number;
  totalTokens: number;
  expectedYield: number;
  image: string;
  status: string;
}

const PROPERTY_TOKEN_ADDRESS = "0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b";

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params['property-id'] as string;

  // State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [modalBuyAmount, setModalBuyAmount] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [ethPriceLoading, setEthPriceLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isSuccess, error } = useWaitForTransactionReceipt({ hash });
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Check if on correct network
  const isOnCorrectNetwork = chainId === baseSepolia.id;

  // Mock property data for duna-studio
  const property: Property = {
    id: "duna-studio",
    name: "Duna Studio",
    location: "Roatán, Honduras",
    jurisdiction: "Prospera",
    fullPrice: 120000,
    tokenPrice: 119,
    totalTokens: 1000,
    expectedYield: 8.5,
    image: "/images/dunaResidences/duna_studio.png",
    status: "live"
  };

  // Fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        setEthPriceLoading(true);
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
        setEthPrice(3770); // Fallback price
      } finally {
        setEthPriceLoading(false);
      }
    };

    fetchEthPrice();
  }, []);

  // Calculate ETH amount for $119 with buffer for price fluctuations
  const ethAmountPerToken = useMemo(() => {
    if (!ethPrice) return 0.0316; // Contract price is ~0.0316 ETH
    return 0.0316; // Use contract price directly
  }, [ethPrice]);

  // Fetch tokens
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/transactions/tokens/1`);
        if (response.ok) {
          const data = await response.json();
          setTokens(data);
        } else {
          console.error('Failed to fetch tokens');
          setTokens([]);
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        setTokens([]);
      }
    };

    fetchTokens();
  }, []);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      alert('✅ Tokens purchased successfully!');
      setIsMinting(false);
      setShowBuyModal(false);
      // Reload the page to show updated token list
      window.location.reload();
    }
  }, [isSuccess]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      console.error('=== TRANSACTION ERROR DETAILS ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      console.error('================================');
      
      alert(`❌ Transaction failed: ${error.message}`);
      setIsMinting(false);
    }
  }, [error]);

  // Reset minting state after 60 seconds if stuck
  useEffect(() => {
    if (isMinting) {
      const timeout = setTimeout(() => {
        console.log('=== TRANSACTION TIMEOUT AFTER 60 SECONDS ===');
        console.log('This could be due to:');
        console.log('- Network congestion on Base Sepolia');
        console.log('- Low gas price');
        console.log('- Contract execution taking too long');
        console.log('- MetaMask not responding');
        console.log('==========================================');
        
        setIsMinting(false);
        alert('Transaction timed out after 60 seconds. This might be due to network congestion. Please try again.');
      }, 60000); // Wait 60 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [isMinting]);

  // Reset minting state when transaction status changes
  useEffect(() => {
    if (!isPending && !isMinting) {
      setIsMinting(false);
      
      // Show success message if transaction was successful
      if (isSuccess && !error) {
        setPurchaseStatus('success');
        setPurchaseMessage(`Successfully purchased ${modalBuyAmount} token${modalBuyAmount > 1 ? 's' : ''}!`);
        setShowSuccessCard(true);
      }
      
      // Show error message if transaction failed
      if (error) {
        setPurchaseStatus('error');
        setPurchaseMessage(error.message || 'Transaction failed. Please try again.');
      }
    }
  }, [isPending, isMinting, isSuccess, error, modalBuyAmount]);

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
          <span>Back to Marketplace</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Image */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Active Sale
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-gradient-card border border-white/5 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-4">{property.name}</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-text-muted" />
                  <span className="text-text-muted">{property.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-text-muted" />
                  <span className="text-text-muted">Jurisdiction: {property.jurisdiction}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-text-muted" />
                  <span className="text-text-muted">Expected Yield: {property.expectedYield}%</span>
                </div>

                {/* Studio Specifications */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Studio Specifications</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-text-muted">📐 Size:</span>
                      <span className="text-text-primary font-medium">From 31m²</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-text-muted">☀️ Long-term stays:</span>
                      <span className="text-text-primary font-medium">Starting at $850/month</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-text-muted">🌙 Short-term stays:</span>
                      <span className="text-text-primary font-medium">Starting at $100/night</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-text-muted">💰 Ownership:</span>
                      <span className="text-text-primary font-medium">Starting at $120,000</span>
                    </div>
                  </div>
                </div>

                {/* About Duna Residences */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">About Duna Residences</h3>
                  <p className="text-text-muted text-sm leading-relaxed mb-3">
                    Duna Residences offers modern studio apartments in the heart of Roatán, Honduras. 
                    This exclusive tower combines contemporary design with tropical luxury, featuring 
                    state-of-the-art amenities and stunning ocean views.
                  </p>
                  <p className="text-text-muted text-sm leading-relaxed">
                    Each studio apartment is thoughtfully designed to maximize space and comfort, 
                    featuring premium finishes, smart home technology, and access to world-class 
                    facilities including a rooftop pool and wellness center.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Token Trading */}
          <div className="space-y-6">
            {/* Token Stats */}
            <div className="bg-gradient-card border border-white/5 rounded-lg p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">Token Information</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-primary">${property.tokenPrice}</div>
                  <div className="text-sm text-text-muted">Price per Token</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-primary">{property.totalTokens}</div>
                  <div className="text-sm text-text-muted">Total Tokens</div>
                </div>
              </div>

              <button
                onClick={() => setShowBuyModal(true)}
                className="w-full py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Buy Now
              </button>
            </div>

            {/* Token Marketplace */}
            <div className="bg-gradient-card border border-white/5 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-primary">Token Marketplace</h3>
                <button className="text-accent-primary hover:underline text-sm">
                  View All Listings
                </button>
              </div>

              {tokens.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {tokens.map((token) => (
                    <div key={token.id} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-accent-primary/50 transition-colors cursor-pointer">
                      <div className="text-center">
                        <div className="text-lg font-bold text-text-primary">#{token.token_number}</div>
                        <div className="text-sm text-text-muted">Token</div>
                        {token.is_for_sale && token.current_price && (
                          <div className="text-xs text-accent-primary mt-1">
                            ${token.current_price}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-text-muted mb-2">No tokens listed for sale</div>
                  <div className="text-sm text-text-muted">Be the first to list your tokens!</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Gallery */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-text-primary mb-4">Property Gallery</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <img src="/images/dunaResidences/duna_tower_main.png" alt="Duna Tower" className="w-full h-48 object-cover rounded-lg" />
            <img src="/images/dunaResidences/duna_studio_birdsView.png" alt="Studio Bird's View" className="w-full h-48 object-cover rounded-lg" />
            <img src="/images/dunaResidences/duna_unit_801.png" alt="Unit 801" className="w-full h-48 object-cover rounded-lg" />
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            {/* Success Card */}
            {showSuccessCard ? (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-2">Purchase Successful!</h3>
                <p className="text-text-muted mb-6">
                  {purchaseMessage}
                </p>
                <button
                  onClick={() => {
                    setShowBuyModal(false);
                    setShowSuccessCard(false);
                    setPurchaseStatus('idle');
                    setPurchaseMessage('');
                  }}
                  className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-text-primary">Buy Tokens</h3>
                  <button 
                    onClick={() => setShowBuyModal(false)}
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
            
            <div className="space-y-4">
              {/* Success/Error Messages */}
              {purchaseStatus === 'success' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">
                      {purchaseMessage}
                    </span>
                  </div>
                </div>
              )}
              
              {purchaseStatus === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-red-400 font-medium">
                      {purchaseMessage}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Transaction Status */}
              {(isMinting || isPending) && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span className="text-sm text-blue-400 font-medium">
                      {isMinting ? 'Preparing Purchase...' : 
                       isPending ? 'Waiting for MetaMask...' : 'Processing...'}
                    </span>
                  </div>
                  {hash && (
                    <p className="text-xs text-blue-300 mt-1">
                      Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
                    </p>
                  )}
                </div>
              )}

              {/* Wallet Status */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-text-muted" />
                  <span className="text-sm text-text-muted">Wallet Status:</span>
                  <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                {isConnected && address && (
                  <div className="text-xs text-text-muted mt-1">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                )}
                
                {/* Network Status */}
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-text-muted">Network:</span>
                      <span className={`text-sm font-medium ${isOnCorrectNetwork ? 'text-green-400' : 'text-red-400'}`}>
                        {isOnCorrectNetwork ? 'Base Sepolia' : 'Wrong Network'}
                      </span>
                    </div>
                    {isConnected && !isOnCorrectNetwork && (
                      <button
                        onClick={() => switchChain({ chainId: baseSepolia.id })}
                        className="text-xs bg-accent-primary text-white px-2 py-1 rounded hover:opacity-90 transition-opacity"
                      >
                        Switch Network
                      </button>
                    )}
                  </div>
                  {!isOnCorrectNetwork && (
                    <p className="text-xs text-text-muted mt-1">
                      Please switch to Base Sepolia to mint tokens
                    </p>
                  )}
                  {isOnCorrectNetwork && (
                    <p className="text-xs text-text-muted mt-1">
                      Need Base Sepolia ETH? Get it from <a href="https://bridge.base.org/" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">Base Bridge</a>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-2">Number of Tokens</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setModalBuyAmount(Math.max(1, modalBuyAmount - 1))}
                    disabled={modalBuyAmount <= 1}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-text-primary font-bold text-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={modalBuyAmount}
                    onChange={(e) => setModalBuyAmount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary text-center font-semibold text-lg"
                  />
                  <button
                    onClick={() => setModalBuyAmount(Math.min(10, modalBuyAmount + 1))}
                    disabled={modalBuyAmount >= 10}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-text-primary font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-1 text-center">Max 10 tokens per transaction</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-muted">Price per token</span>
                  <span className="text-text-primary">
                    ${property.tokenPrice} 
                    {ethPriceLoading ? (
                      <span className="text-text-muted">(loading ETH price...)</span>
                    ) : (
                      <span className="text-text-muted">(≈ {ethAmountPerToken.toFixed(4)} ETH)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-muted">Quantity</span>
                  <span className="text-text-primary">{modalBuyAmount}</span>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-text-primary">Total</span>
                    <span className="text-accent-primary">
                      ${(modalBuyAmount * property.tokenPrice).toLocaleString()}
                      {!ethPriceLoading && (
                        <span className="text-text-muted"> (≈ {(modalBuyAmount * ethAmountPerToken).toFixed(4)} ETH)</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 text-center">1000 tokens available for minting</p>
                  <p className="text-xs text-blue-400 mt-1 text-center">+5% buffer added for price stability</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 py-2 px-4 bg-white/10 text-text-primary rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    try {
                      if (!isConnected) {
                        alert('Please connect your wallet first');
                        return;
                      }

                      if (!isOnCorrectNetwork) {
                        alert('Please switch to Base Sepolia network first');
                        return;
                      }

                      console.log('=== TRANSACTION PREPARATION ===');
                      console.log('Token amount:', modalBuyAmount);
                      console.log('ETH amount per token:', ethAmountPerToken);
                      console.log('Total ETH value:', modalBuyAmount * ethAmountPerToken);
                      console.log('Contract address:', PROPERTY_TOKEN_ADDRESS);
                      console.log('Network:', chainId);
                      console.log('Wallet address:', address);
                      console.log('Is connected:', isConnected);
                      console.log('Is on correct network:', isOnCorrectNetwork);
                      console.log('================================');
                      
                      setIsMinting(true);
                      
                      // Call the blockchain contract to purchase tokens
                      writeContract({
                        address: PROPERTY_TOKEN_ADDRESS as `0x${string}`,
                        abi: [
                          {
                            "inputs": [
                              {
                                "internalType": "uint256",
                                "name": "_tokenAmount",
                                "type": "uint256"
                              }
                            ],
                            "name": "purchaseTokens",
                            "outputs": [],
                            "stateMutability": "payable",
                            "type": "function"
                          }
                        ],
                        functionName: 'purchaseTokens',
                        args: [BigInt(modalBuyAmount)],
                        value: parseEther((modalBuyAmount * ethAmountPerToken).toString()),
                        gas: BigInt(300000) // Set explicit gas limit
                      });
                      
                    } catch (error) {
                      console.error('Minting error:', error);
                      alert(`Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      setIsMinting(false);
                    }
                  }}
                  disabled={isMinting || isPending || !isConnected || ethPriceLoading || !isOnCorrectNetwork}
                  className="flex-1 py-2 px-4 bg-gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isMinting || isPending ? 'Preparing Purchase...' : 
                   !isConnected ? 'Connect Wallet' : 
                   !isOnCorrectNetwork ? 'Switch to Base Sepolia' :
                   ethPriceLoading ? 'Loading ETH Price...' : 'Buy Tokens'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )}
      

    </div>
  );
}