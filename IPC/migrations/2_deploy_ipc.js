var IPC = artifacts.require("IPC.sol");
var BN128 = artifacts.require("BN128.sol");

module.exports = function (deployer) {
    deployer.deploy(BN128);
    deployer.link(BN128, IPC);
    deployer.deploy(IPC);
};