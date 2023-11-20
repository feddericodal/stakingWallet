require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: 5000,
      }
    },
  },
  solidity: "0.8.20",
  
};
