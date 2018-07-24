// Allows us to use ES6 in our migrations and tests.
require('babel-register')
var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "drill rubber album slide opinion gold broccoli arch mask frame mesh poverty"

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/c6b7ec52b2d545e3994ecb01902cafd3")
      },
      network_id: 3,
      gas: 4700000
    }
  }
}
