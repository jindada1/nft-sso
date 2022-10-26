const DAMC = artifacts.require("DAMC");
const utils = require("../utils")

let DAID = "0xd1c993f56c197375f0a396cd08e45424f594a757fe1a309e104aeb5373007d23"
let DAURI = "OFW123EFOF"

contract('DAMC', (accounts) => {

    it(`should create a DA`, async () => {
        const damc = await DAMC.deployed();

        let tokenId = await damc.Create.call(DAID, DAURI);
        let gasUsed = await damc.Create.estimateGas(DAID, DAURI);
        console.log(gasUsed);

        await damc.Create(DAID, DAURI);

        let tokenURI = await damc.tokenURI.call(DAID);
        console.log(tokenURI);

        assert.equal(utils.bnToHex(tokenId), DAID, "create DA failed")
        assert.equal(tokenURI, DAURI, "create DA failed")
    });

});