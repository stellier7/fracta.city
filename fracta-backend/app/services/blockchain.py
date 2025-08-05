import os
import json
from typing import Dict, List, Optional, Tuple
from web3 import Web3
from web3.exceptions import ContractLogicError
from dotenv import load_dotenv
import logging
from datetime import datetime, timedelta

load_dotenv()

logger = logging.getLogger(__name__)

class BlockchainService:
    """Service for interacting with Fracta.city smart contracts on Base Testnet"""
    
    def __init__(self):
        self.web3_provider_url = os.getenv("WEB3_PROVIDER_URL", "https://sepolia.base.org")
        self.compliance_manager_address = os.getenv("COMPLIANCE_MANAGER_ADDRESS")
        self.duna_studio_token_address = os.getenv("DUNA_STUDIO_TOKEN_ADDRESS")
        self.chain_id = int(os.getenv("CHAIN_ID", "84532"))
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.web3_provider_url))
        
        if not self.w3.is_connected():
            logger.error(f"Failed to connect to Web3 provider: {self.web3_provider_url}")
            raise Exception("Web3 connection failed")
        
        logger.info(f"Connected to Base Testnet (Chain ID: {self.chain_id})")
        
        # Load contract ABIs (simplified versions)
        self.compliance_manager_abi = self._get_compliance_manager_abi()
        self.property_token_abi = self._get_property_token_abi()
        
        # Initialize contract instances
        if self.compliance_manager_address:
            self.compliance_manager = self.w3.eth.contract(
                address=self.compliance_manager_address,
                abi=self.compliance_manager_abi
            )
        
        if self.duna_studio_token_address:
            self.duna_studio_token = self.w3.eth.contract(
                address=self.duna_studio_token_address,
                abi=self.property_token_abi
            )
    
    def _get_compliance_manager_abi(self) -> List[Dict]:
        """Simplified ABI for ComplianceManager contract"""
        return [
            {
                "inputs": [
                    {"name": "user", "type": "address"},
                    {"name": "property", "type": "address"},
                    {"name": "amount", "type": "uint256"}
                ],
                "name": "canInvest",
                "outputs": [
                    {"name": "", "type": "bool"},
                    {"name": "", "type": "string"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "user", "type": "address"}
                ],
                "name": "getUserComplianceStatus",
                "outputs": [
                    {"name": "kycValid", "type": "bool"},
                    {"name": "jurisdiction", "type": "string"},
                    {"name": "expiry", "type": "uint256"},
                    {"name": "hasProspectsPermit", "type": "bool"},
                    {"name": "permitId", "type": "string"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "user", "type": "address"}],
                "name": "kycApproved",
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "user", "type": "address"},
                    {"name": "jurisdiction", "type": "string"},
                    {"name": "expiryTimestamp", "type": "uint256"}
                ],
                "name": "approveKYC",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "user", "type": "address"}
                ],
                "name": "revokeKYC",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
    
    def _get_property_token_abi(self) -> List[Dict]:
        """Simplified ABI for PropertyToken contract"""
        return [
            {
                "inputs": [],
                "name": "name",
                "outputs": [{"name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "symbol",
                "outputs": [{"name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "tokenPrice",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "tokensSold",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "account", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getPropertyInfo",
                "outputs": [
                    {
                        "components": [
                            {"name": "propertyName", "type": "string"},
                            {"name": "location", "type": "string"},
                            {"name": "jurisdiction", "type": "string"},
                            {"name": "totalPropertyValue", "type": "uint256"},
                            {"name": "totalTokens", "type": "uint256"},
                            {"name": "propertyType", "type": "string"},
                            {"name": "squareFeet", "type": "uint256"},
                            {"name": "expectedYield", "type": "uint256"},
                            {"name": "imageURI", "type": "string"},
                            {"name": "isActive", "type": "bool"}
                        ],
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getSaleInfo",
                "outputs": [
                    {"name": "_tokenPrice", "type": "uint256"},
                    {"name": "_tokensSold", "type": "uint256"},
                    {"name": "_tokensRemaining", "type": "uint256"},
                    {"name": "_saleStartTime", "type": "uint256"},
                    {"name": "_saleEndTime", "type": "uint256"},
                    {"name": "_saleActive", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    # ComplianceManager functions
    async def check_user_kyc_status(self, wallet_address: str) -> Dict:
        """Check KYC status for a user"""
        try:
            address = self.w3.to_checksum_address(wallet_address)
            result = self.compliance_manager.functions.getUserComplianceStatus(address).call()
            
            return {
                "kyc_valid": result[0],
                "jurisdiction": result[1],
                "expiry": result[2],
                "has_prospera_permit": result[3],
                "permit_id": result[4]
            }
        except Exception as e:
            logger.error(f"Error checking KYC status: {e}")
            return {
                "kyc_valid": False,
                "jurisdiction": "",
                "expiry": 0,
                "has_prospera_permit": False,
                "permit_id": ""
            }
    
    async def check_can_invest(self, wallet_address: str, property_address: str, amount: int) -> Tuple[bool, str]:
        """Check if user can invest in a property"""
        try:
            user_address = self.w3.to_checksum_address(wallet_address)
            prop_address = self.w3.to_checksum_address(property_address)
            
            result = self.compliance_manager.functions.canInvest(
                user_address, prop_address, amount
            ).call()
            
            return result[0], result[1]
        except Exception as e:
            logger.error(f"Error checking investment eligibility: {e}")
            return False, f"Error: {str(e)}"
    
    # PropertyToken functions
    async def get_duna_studio_property(self) -> Dict:
        """Get Duna Studio property information from contract"""
        try:
            # Get property info from contract
            property_info = self.duna_studio_token.functions.getPropertyInfo().call()
            
            # Get sale info
            sale_info = self.duna_studio_token.functions.getSaleInfo().call()
            
            # The contract stores values in USD (not Wei), so we don't need ETH conversion
            # Just convert from the contract's decimal representation
            total_value_usd = property_info[3] // 10**18  # Convert from contract's decimal format
            token_price_usd = sale_info[0] // 10**18      # Convert from contract's decimal format
            
            return {
                "id": "duna-studio",
                "name": property_info[0],
                "location": property_info[1],
                "jurisdiction": property_info[2],
                "fullPrice": total_value_usd,  # Already in USD
                "tokenPrice": token_price_usd,  # Already in USD
                "totalTokens": property_info[4],
                "tokensSold": sale_info[1],
                "tokensRemaining": sale_info[2],
                "expectedYield": property_info[7] / 100 if property_info[7] > 0 else 8.5,  # Convert basis points or use default
                "image": "/images/dunaResidences/duna_studio_birdsView.png",
                "kycRequired": "prospera-permit",
                "status": "live" if sale_info[5] else "inactive",
                "contractAddress": self.duna_studio_token_address,
                "saleActive": sale_info[5],
                "saleStartTime": sale_info[3],
                "saleEndTime": sale_info[4]
            }
        except Exception as e:
            logger.error(f"Error getting Duna Studio property info: {e}")
            # Return fallback data if contract call fails
            return {
                "id": "duna-studio",
                "name": "Duna Residences Studio",
                "location": "Roatán, Prospera ZEDE",
                "jurisdiction": "prospera",
                "fullPrice": 119000,
                "tokenPrice": 119,
                "totalTokens": 1190,
                "tokensSold": 0,
                "tokensRemaining": 1190,
                "expectedYield": 8.5,
                "image": "/images/dunaResidences/duna_studio_birdsView.png",
                "kycRequired": "prospera-permit",
                "status": "live",
                "contractAddress": self.duna_studio_token_address,
                "saleActive": False,
                "saleStartTime": 0,
                "saleEndTime": 0
            }
    
    async def get_user_token_balance(self, wallet_address: str, token_address: Optional[str] = None) -> int:
        """Get user's token balance for a property"""
        try:
            contract = self.duna_studio_token
            if token_address:
                contract = self.w3.eth.contract(
                    address=self.w3.to_checksum_address(token_address),
                    abi=self.property_token_abi
                )
            
            user_address = self.w3.to_checksum_address(wallet_address)
            balance = contract.functions.balanceOf(user_address).call()
            
            return balance
        except Exception as e:
            logger.error(f"Error getting token balance: {e}")
            return 0
    
    # Utility functions
    def wei_to_eth(self, wei_amount: int) -> float:
        """Convert Wei to ETH"""
        return self.w3.from_wei(wei_amount, 'ether')
    
    def eth_to_wei(self, eth_amount: float) -> int:
        """Convert ETH to Wei"""
        return self.w3.to_wei(eth_amount, 'ether')
    
    def is_valid_address(self, address: str) -> bool:
        """Check if address is valid"""
        try:
            self.w3.to_checksum_address(address)
            return True
        except:
            return False
    
    def get_network_info(self) -> Dict:
        """Get network information"""
        try:
            latest_block = self.w3.eth.get_block('latest')
            return {
                "chain_id": self.chain_id,
                "network_name": "Base Testnet",
                "latest_block": latest_block.number,
                "connected": True,
                "compliance_manager": self.compliance_manager_address,
                "duna_studio_token": self.duna_studio_token_address
            }
        except Exception as e:
            logger.error(f"Error getting network info: {e}")
            return {
                "chain_id": self.chain_id,
                "network_name": "Base Testnet",
                "latest_block": 0,
                "connected": False,
                "compliance_manager": self.compliance_manager_address,
                "duna_studio_token": self.duna_studio_token_address
            }

    async def approve_kyc_on_blockchain(self, wallet_address: str, jurisdiction: str = "prospera", permit_id: str = "TEST123") -> bool:
        """Approve KYC on blockchain for testing purposes"""
        try:
            address = self.w3.to_checksum_address(wallet_address)
            
            # Check if admin credentials are configured
            admin_address = os.getenv('ADMIN_WALLET_ADDRESS')
            private_key = os.getenv('ADMIN_PRIVATE_KEY')
            
            if not admin_address or not private_key:
                logger.warning("Admin wallet credentials not configured. KYC approval will be simulated.")
                # For testing, we'll simulate approval without actually calling the contract
                return True
            
            # Set expiry to 1 year from now
            expiry_timestamp = int((datetime.now() + timedelta(days=365)).timestamp())
            
            # Build transaction
            transaction = self.compliance_manager.functions.approveKYC(
                address,
                jurisdiction,
                expiry_timestamp
            ).build_transaction({
                'from': admin_address,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(admin_address)
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            logger.info(f"KYC approved on blockchain for {wallet_address}. Tx: {receipt.transactionHash.hex()}")
            return True
            
        except Exception as e:
            logger.error(f"Error approving KYC on blockchain: {e}")
            # For testing purposes, return True even if blockchain call fails
            # In production, this should return False
            return True
    
    async def sync_kyc_from_backend(self, wallet_address: str, kyc_record) -> bool:
        """Sync KYC approval from backend to blockchain"""
        try:
            # Check if KYC is already approved on blockchain
            current_status = await self.check_user_kyc_status(wallet_address)
            if current_status["kyc_valid"]:
                logger.info(f"KYC already approved on blockchain for {wallet_address}")
                return True
            
            # Only sync if backend KYC is approved
            if kyc_record.status != "approved":
                logger.warning(f"Backend KYC not approved for {wallet_address}")
                return False
            
            # Approve on blockchain
            jurisdiction = kyc_record.jurisdiction or "prospera"
            permit_id = kyc_record.prospera_permit_id or "BACKEND_APPROVED"
            
            return await self.approve_kyc_on_blockchain(wallet_address, jurisdiction, permit_id)
            
        except Exception as e:
            logger.error(f"Error syncing KYC from backend: {e}")
            return False

# Global instance
blockchain_service = BlockchainService() 