/* hardhat.config.js */
require("@nomiclabs/hardhat-waffle")



module.exports = {
  development: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
//  unused configuration commented out for now
  mumbai: {
    url: "https://rpc-mumbai.maticvigil.com",
    accounts: ["dbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97"]  }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}