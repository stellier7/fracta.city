const { ethers } = require("hardhat");

async function main() {
    // Your wallet address
    const userAddress = "0xDF7dC773d20827E4796cbAeFf5113b4F9514BE34";
    
    // ComplianceManager contract address (from step 1)
    const complianceManagerAddress = "0x9E7C50EBc62f7A0C97BF8b1D3f274b58dB11aB8F";
    
    // Get the ComplianceManager contract
    const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
    const complianceManager = ComplianceManager.attach(complianceManagerAddress);
    
    console.log("Checking KYC status for address:", userAddress);
    console.log("ComplianceManager address:", complianceManagerAddress);
    
    // Check KYC status
    const kycStatus = await complianceManager.getUserComplianceStatus(userAddress);
    console.log("KYC Status:", {
        kycValid: kycStatus[0],
        jurisdiction: kycStatus[1],
        expiry: new Date(Number(kycStatus[2]) * 1000),
        hasProspectsPermit: kycStatus[3],
        permitId: kycStatus[4]
    });
    
    // Check if KYC is approved
    const isApproved = await complianceManager.kycApproved(userAddress);
    console.log("KYC Approved:", isApproved);
    
    // Check if can invest
    const propertyTokenAddress = "0xd312662Bd68743469dbFC9b819EA7c4Ba50aCB9b";
    const checksummedAddress = ethers.getAddress(propertyTokenAddress);
    console.log("PropertyToken checksummed address:", checksummedAddress);
    const canInvest = await complianceManager.canInvest(userAddress, checksummedAddress, 1);
    console.log("Can Invest:", canInvest);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 