var TestToken = artifacts.require("./TestToken.sol");
var TimeVaultFactory = artifacts.require("TimeVaultFactory");

module.exports = function(deployer) {
  deployer.deploy(TestToken);
  deployer.deploy(TimeVaultFactory);
};
