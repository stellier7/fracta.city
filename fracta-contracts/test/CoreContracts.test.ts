import { expect } from "chai";
import { ethers } from "hardhat";

describe("Core Fracta Contracts", function () {
  it("Should deploy ComplianceManager", async function () {
    const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
    const complianceManager = await ComplianceManager.deploy();
    expect(complianceManager.target).to.be.properAddress;
  });

  it("Should deploy PropertyToken", async function () {
    const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
    const complianceManager = await ComplianceManager.deploy();
    
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = await PropertyToken.deploy(
      "Test Property",
      "Test Location", 
      "prospera",
      ethers.parseEther("100000"),
      1000,
      ethers.parseEther("100"),
      complianceManager.target
    );
    
    expect(propertyToken.target).to.be.properAddress;
    expect(await propertyToken.name()).to.equal("Fracta Test Property");
  });
});
