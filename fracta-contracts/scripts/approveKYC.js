const { ethers } = require("hardhat");

async function main() {
    // Your wallet address
    const userAddress = "0xDF7dC773d20827E4796cbAeFf5113b4F9514BE34";
    
    // Get the ComplianceManager contract
    const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
    const complianceManager = ComplianceManager.attach("0x9E7C50EBc62f7A0C97BF8b1D3f274b58dB11aB8F");
    
    console.log("Approving KYC for address:", userAddress);
    
    // Set expiry to 1 year from now
    const expiryTimestamp = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
    
    // Approve KYC
    const tx = await complianceManager.approveKYC(
        userAddress,
        "prospera", // jurisdiction
        expiryTimestamp
    );
    
    console.log("Transaction hash:", tx.hash);
    
    // Wait for transaction to be mined
    await tx.wait();
    
    console.log("KYC approved successfully!");
    
    // Verify the approval
    const kycStatus = await complianceManager.getUserComplianceStatus(userAddress);
    console.log("KYC Status:", {
        kycValid: kycStatus[0],
        jurisdiction: kycStatus[1],
        expiry: new Date(Number(kycStatus[2]) * 1000),
        hasProspectsPermit: kycStatus[3],
        permitId: kycStatus[4]
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 