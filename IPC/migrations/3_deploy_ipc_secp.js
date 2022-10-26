var IPC_Secp = artifacts.require("IPC_Secp.sol");
var Secp256K1 = artifacts.require("Secp256K1.sol");

module.exports = function (deployer) {
    deployer.deploy(Secp256K1);
    deployer.link(Secp256K1, IPC_Secp);
    deployer.deploy(IPC_Secp);
};