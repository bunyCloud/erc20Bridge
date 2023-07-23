const { ethers } = require("hardhat");

const localChainId = "31337";

// const sleep = (ms) =>
//   new Promise((r) =>
//     setTimeout(() => {
//       console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
//       r();
//     }, ms)
//   );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // Deploy Bridge contract
  const bridgeDeployment = await deploy("Bridge", {
    from: deployer,
    log: true,
    waitConfirmations: 2,
  });

  // Wait for the deployment of Bridge to be confirmed
  await bridgeDeployment.wait();

  // Deploy BridgeToken contract after Bridge is deployed
  const bridgeTokenDeployment = await deploy("BridgeToken", {
    from: deployer,
    log: true,
    waitConfirmations: 2,
    args: [bridgeDeployment.address], // Pass the address of the deployed Bridge contract as an argument
  });

  // Wait for the deployment of BridgeToken to be confirmed
  await bridgeTokenDeployment.wait();
};

module.exports.tags = ["Bridge"];
