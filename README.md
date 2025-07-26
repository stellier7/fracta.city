# Fracta.city 🏠💎

**Tokenized Real Estate Platform - Democratizing Property Investment Through Blockchain**

Fracta.city enables fractional ownership of real estate through compliant ERC-20 tokens, starting with properties in Roatán, Prospera ZEDE, Honduras.

---

## 🚀 **Current Status: LIVE ON BASE TESTNET**

✅ **Phase 1**: Frontend with wallet integration - COMPLETE  
✅ **Phase 2**: Backend API with database models - COMPLETE  
✅ **Phase 3**: Smart contracts deployed to Base Testnet - COMPLETE  
🔄 **Phase 4**: Integration & Testing - IN PROGRESS

---

## 📁 **Project Structure**

```
fractaCity/
├── 🎨 fracta-frontend/          # Next.js 15 + TypeScript + Tailwind
├── ⚙️  fracta-backend/           # FastAPI + Python + PostgreSQL  
├── 🏗️  fracta-contracts/        # Hardhat + Solidity + OpenZeppelin
├── 📋 pseudocode_fracta.txt     # Original build instructions
└── 📖 README.md                 # This file
```

---

## 🔗 **Deployed Smart Contracts - Base Testnet**

| Contract | Address | Purpose |
|----------|---------|---------|
| **ComplianceManager** | [`0x83f3707C2a6E518b18a9AA7b53D3fdda892211B3`](https://sepolia-explorer.base.org/address/0x83f3707C2a6E518b18a9AA7b53D3fdda892211B3) | KYC & Transfer Restrictions |
| **Duna Studio Token** | [`0x5d534a0DC52BE367A1a125018Aa9da5523F0B8F9`](https://sepolia-explorer.base.org/address/0x5d534a0DC52BE367A1a125018Aa9da5523F0B8F9) | Property Token (1,190 tokens @ $100 each) |

### 🏠 **Featured Property**
- **Property**: Duna Residences Studio
- **Location**: Roatán, Prospera ZEDE, Honduras  
- **Total Value**: $119,000 USD
- **Total Tokens**: 1,190
- **Price per Token**: ~$100 USD
- **Jurisdiction**: Prospera (requires Prospera permit)

---

## 🛠️ **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- Python 3.9+
- PostgreSQL
- MetaMask or compatible Web3 wallet

### **1. Frontend Setup**
```bash
cd fracta-frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

### **2. Backend Setup**  
```bash
cd fracta-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# Opens on http://localhost:8000
```

### **3. Smart Contracts**
```bash
cd fracta-contracts
npm install
npm run compile
npm run test
```

---

## 🔧 **Environment Variables**

### **Frontend (.env.local)**
```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_id
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **Backend (.env)**
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost/fracta_db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Blockchain - Base Testnet
CHAIN_ID=84532
RPC_URL=https://sepolia.base.org
COMPLIANCE_MANAGER_ADDRESS=0x83f3707C2a6E518b18a9AA7b53D3fdda892211B3
DUNA_STUDIO_TOKEN_ADDRESS=0x5d534a0DC52BE367A1a125018Aa9da5523F0B8F9

# APIs
FRONTEND_URL=http://localhost:3000
PROSPERA_KYC_API_URL=https://api.prosperakyc.com
PROSPERA_API_KEY=your-prospera-api-key
```

### **Smart Contracts (.env)**
```bash
PRIVATE_KEY=your_wallet_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_optional
REPORT_GAS=true
```

---

## 🏗️ **Architecture**

### **Frontend Stack**
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Custom Design System
- **Blockchain**: Wagmi + Viem + RainbowKit
- **State**: React Query + Zustand
- **UI**: Lucide Icons + Custom Components

### **Backend Stack**
- **Framework**: FastAPI + Pydantic
- **Database**: PostgreSQL + SQLAlchemy + Alembic
- **Blockchain**: Web3.py
- **Auth**: JWT + Wallet Signature Verification
- **Cache**: Redis (optional)

### **Smart Contracts Stack**
- **Framework**: Hardhat + TypeScript
- **Contracts**: Solidity 0.8.24 + OpenZeppelin
- **Testing**: Hardhat + Ethers.js + Chai
- **Network**: Base (Testnet & Mainnet)

---

## 💰 **Token Economics**

### **Compliance Model**
- **ERC-1404**: Restricted token transfers
- **KYC Required**: Prospera permit or international KYC
- **Jurisdiction Support**: Prospera ZEDE + International

### **Investment Model**
- **Minimum Investment**: $100 (1 token)
- **Fractional Ownership**: True property ownership
- **Revenue Sharing**: Rental income distribution (planned)
- **Governance**: Token holder voting (planned)

---

## 📊 **Features**

### **✅ Current Features**
- 🎨 **Beautiful Frontend** - Modern dark theme with 3D effects
- 🔐 **Wallet Connection** - MetaMask + WalletConnect support
- 📋 **Property Listings** - Real property data and images
- 🛡️ **KYC System** - Prospera permit + international verification
- 💎 **Token Deployment** - Live property tokens on Base Testnet
- 📱 **Responsive Design** - Mobile-first approach

### **🔄 In Development** 
- 🔗 **Backend Integration** - Connect frontend to APIs
- 💰 **Token Purchases** - Buy property tokens with ETH
- 📈 **Portfolio Dashboard** - Track investments
- 💸 **Revenue Distribution** - Rental income payouts

### **📋 Planned Features**
- 🏭 **Token Factory** - Deploy multiple property tokens
- 🗳️ **Governance** - Token holder voting
- 📊 **Analytics** - Investment performance tracking
- 🌍 **Multi-language** - Spanish + English support

---

## 🚀 **Deployment**

### **Frontend** - Vercel
```bash
cd fracta-frontend
npm run build
vercel --prod
```

### **Backend** - Railway
```bash
cd fracta-backend
# Set up Railway project
railway login
railway link
railway up
```

### **Smart Contracts** - Base Mainnet
```bash
cd fracta-contracts
npm run deploy:base
npm run verify:base
```

---

## 🧪 **Testing**

### **Frontend Tests**
```bash
cd fracta-frontend
npm run test
npm run test:e2e
```

### **Backend Tests**  
```bash
cd fracta-backend
pytest
pytest --cov=app
```

### **Smart Contract Tests**
```bash
cd fracta-contracts
npm run test
npm run test:gas
```

---

## 🛡️ **Security**

### **Smart Contract Security**
- ✅ OpenZeppelin battle-tested libraries
- ✅ Reentrancy protection on all payable functions
- ✅ Access control with Ownable pattern
- ✅ Pausable contracts for emergency stops
- ✅ ERC-1404 compliant transfer restrictions

### **Backend Security**
- ✅ JWT authentication
- ✅ Wallet signature verification
- ✅ CORS protection
- ✅ Input validation with Pydantic
- ✅ SQL injection protection with SQLAlchemy

### **Frontend Security**
- ✅ Environment variable protection
- ✅ Secure wallet connection
- ✅ XSS protection
- ✅ HTTPS enforcement

---

## 📞 **Support & Contact**

- **Website**: https://fracta.city (coming soon)
- **GitHub**: https://github.com/stellier7/fracta.city
- **Email**: team@fracta.city
- **Documentation**: [API Docs](http://localhost:8000/docs) (local)

---

## 📜 **License**

MIT License - Built for **Fracta.city**

---

## 🙏 **Acknowledgments**

- **Prospera ZEDE** - Progressive jurisdiction enabling innovation
- **Base** - Scalable blockchain infrastructure  
- **OpenZeppelin** - Security-first smart contract libraries
- **Next.js** - React framework for production
- **FastAPI** - Modern, fast web framework for Python

---

**🚀 Built with love for democratizing real estate investment 🏠💎** 