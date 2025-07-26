import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FractaCityDeployModule = buildModule("FractaCityDeploy", (m) => {
  // Deploy ComplianceManager first
  const complianceManager = m.contract("ComplianceManager");
  
  // Example property token deployment (can be used as template)
  const examplePropertyToken = m.contract("PropertyToken", [
    "Duna Residences Studio", // _propertyName
    "Roatán, Prospera ZEDE", // _location  
    "prospera", // _jurisdiction
    "119000000000000000000000", // _totalPropertyValue (119,000 USD in wei)
    "1000", // _totalTokens (119,000 / 119 = 1,000 tokens for cleaner math)
    "119000000000000000000", // _tokenPrice (119 USD in wei)
    complianceManager, // _complianceManager
  ]);
  
  return {
    complianceManager,
    examplePropertyToken,
  };
});

export default FractaCityDeployModule; 