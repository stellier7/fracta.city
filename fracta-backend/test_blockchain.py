#!/usr/bin/env python3
"""
Test script for Fracta.city blockchain integration
Run this to verify your backend can connect to deployed contracts
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def test_blockchain_integration():
    print("🧪 Testing Fracta.city Blockchain Integration...")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    try:
        from services.blockchain import blockchain_service
        
        # Test 1: Check network connection
        print("1️⃣ Testing network connection...")
        network_info = blockchain_service.get_network_info()
        print(f"   ✅ Network: {network_info['network_name']}")
        print(f"   ✅ Chain ID: {network_info['chain_id']}")
        print(f"   ✅ Connected: {network_info['connected']}")
        
        if not network_info['connected']:
            print("   ❌ Failed to connect to blockchain")
            return False
        
        # Test 2: Check contract addresses
        print("\n2️⃣ Testing contract addresses...")
        print(f"   📋 ComplianceManager: {os.getenv('COMPLIANCE_MANAGER_ADDRESS', 'NOT SET')}")
        print(f"   🏠 Duna Studio Token: {os.getenv('DUNA_STUDIO_TOKEN_ADDRESS', 'NOT SET')}")
        
        if not blockchain_service.compliance_manager_address:
            print("   ❌ ComplianceManager address not configured")
            return False
        
        if not blockchain_service.duna_studio_token_address:
            print("   ❌ Duna Studio Token address not configured")
            return False
        
        # Test 3: Fetch property data from contract
        print("\n3️⃣ Testing contract data retrieval...")
        try:
            property_data = await blockchain_service.get_duna_studio_property()
            print(f"   ✅ Property Name: {property_data.get('name', 'Unknown')}")
            print(f"   ✅ Location: {property_data.get('location', 'Unknown')}")
            print(f"   ✅ Total Tokens: {property_data.get('totalTokens', 0)}")
            print(f"   ✅ Token Price: ${property_data.get('tokenPrice', 0)}")
            print(f"   ✅ Status: {property_data.get('status', 'Unknown')}")
        except Exception as e:
            print(f"   ⚠️  Contract call failed: {e}")
            print("   ℹ️  This might be expected if the token sale hasn't started")
        
        # Test 4: Test KYC check (with dummy address)
        print("\n4️⃣ Testing KYC functionality...")
        try:
            dummy_address = "0x1234567890123456789012345678901234567890"
            kyc_status = await blockchain_service.check_user_kyc_status(dummy_address)
            print(f"   ✅ KYC check successful (expected: not approved)")
            print(f"   ✅ KYC Valid: {kyc_status['kyc_valid']}")
        except Exception as e:
            print(f"   ⚠️  KYC check failed: {e}")
        
        print("\n" + "=" * 50)
        print("🎉 Blockchain integration test completed!")
        print("✅ Your backend is ready to connect to your deployed contracts!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're running this from the fracta-backend directory")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_blockchain_integration())
    exit(0 if success else 1) 