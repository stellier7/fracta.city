import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FractaCityDeployModule = buildModule("FractaCityDeploy", (m) => {
  // Deploy ComplianceManager first
  const complianceManager = m.contract("ComplianceManager");
  
  // Deploy Duna Residences Studio PropertyToken
  const dunaStudioToken = m.contract("PropertyToken", [
    "Duna Residences Studio", // _propertyName
    "Roatán, Prospera ZEDE", // _location  
    "prospera", // _jurisdiction
    "119000000000000000000000", // _totalPropertyValue (119,000 USD in wei)
    "1190", // _totalTokens (1,190 tokens)
    "100000000000000000000", // _tokenPrice (100 USD in wei)
    complianceManager, // _complianceManager
  ]);
  
  return {
    complianceManager,
    dunaStudioToken,
  };
});

export default FractaCityDeployModule; 