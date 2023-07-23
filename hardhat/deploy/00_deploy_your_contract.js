const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Deploy Bridge contract
  const bridgeDeployment = await deploy("Bridge", {
    from: deployer,
    log: true,
    waitReceipt: true,
  });

  console.log(`Bridge contract deployed at address: ${bridgeDeployment.address}`);

  // Deploy BridgeToken contract after Bridge is deployed
  const bridgeTokenDeployment = await deploy("BridgeToken", {
    from: deployer,
    log: true,
    waitReceipt: true,
    //args: [bridgeDeployment.address], // Pass the address of the deployed Bridge contract as an argument
  });

  console.log(`BridgeToken contract deployed at address: ${bridgeTokenDeployment.address}`);
};

module.exports.tags = ["Bridge"];
module.exports.tags = ["BridgeToken"];
