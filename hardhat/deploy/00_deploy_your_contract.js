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

  //
  const marketplace = "0x300616A3C499Ff1A540f02dF784472fFf672FbC3"; // telos testnet

  // Deploy
  await deploy("CalendarOne", {
    from: deployer,
    //args: [marketplace],
    log: true,
    waitConfirmations: 2,
  });

};
module.exports.tags = ["CalendarOne"];
