const { ethers } = require("hardhat");

async function main() {
    // Your wallet address
    const userAddress = "0xDF7dC773d20827E4796cbAeFf5113b4F9514BE34";
    
    // ComplianceManager contract address
    const complianceManagerAddress = "0x9E7C50EBc62f7A0C97BF8b1D3f274b58dB11aB8F";
    
    // Get the ComplianceManager contract
    const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
    const complianceManager = ComplianceManager.attach(complianceManagerAddress);
    
    console.log("=== KYC Verification ===");
    console.log("User address:", userAddress);
    console.log("ComplianceManager address:", complianceManagerAddress);
    
    // Check KYC status
    const kycStatus = await complianceManager.getUserComplianceStatus(userAddress);
    console.log("\nKYC Status:", {
        kycValid: kycStatus[0],
        jurisdiction: kycStatus[1],
        expiry: new Date(Number(kycStatus[2]) * 1000),
        hasProspectsPermit: kycStatus[3],
        permitId: kycStatus[4]
    });
    
    // Check if KYC is approved
    const isApproved = await complianceManager.kycApproved(userAddress);
    console.log("KYC Approved:", isApproved);
    
    // Check current timestamp vs expiry
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = Number(kycStatus[2]);
    console.log("Current timestamp:", currentTime);
    console.log("Expiry timestamp:", expiryTime);
    console.log("KYC expired:", currentTime > expiryTime);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 