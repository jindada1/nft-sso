const BN128SC = artifacts.require("IPC");
const utils = require("../utils")
const js_bn128 = require("../curves/bn128.js")

contract('BN128.sol', (accounts) => {

    let Alice = js_bn128.keypair(utils.prikeys[0])
    let Bob = js_bn128.keypair(utils.prikeys[1])

    before(async () => {
        const sol_bn128 = await BN128SC.deployed();

        const Apubkey = await sol_bn128.eccPub(Alice.prikey);
        Alice.pubkey = Apubkey.map(utils.bnToHex)

        const Bpubkey = await sol_bn128.eccPub(Bob.prikey);
        Bob.pubkey = Bpubkey.map(utils.bnToHex)
    });


    it(`eccMul: (sk * G) * 10 == sk * (10 * G)`, async () => {
        const sol_bn128 = await BN128SC.deployed();

        let RSol = await sol_bn128.eccMul(Alice.pubkey, 10);
        RSol = RSol.map(utils.bnToHex)

        const ARsol = await sol_bn128.eccPub(js_bn128.eccMulHex(10, Alice.prikey));

        assert.deepEqual(ARsol.map(BigInt), RSol.map(BigInt), 'eccMul wrong answer');
    });

    it(`eccAdd: (sk * G) + (10 * G) == (sk + 10) * G`, async () => {
        const sol_bn128 = await BN128SC.deployed();

        // (10 * G)
        let G10 = await sol_bn128.eccPub(10);
        G10 = G10.map(utils.bnToHex)
        
        // PK + (10 * G) = (sk * G) + (10 * G)
        let PK_G10 = await sol_bn128.eccAdd(Alice.pubkey, G10);
        PK_G10 = PK_G10.map(utils.bnToHex)

        // (sk + 10) * G
        let sk10_G = await sol_bn128.eccPub(js_bn128.eccAddHex(10, Alice.prikey));
        sk10_G = sk10_G.map(utils.bnToHex)
        
        assert.deepEqual(PK_G10.map(BigInt), sk10_G.map(BigInt), 'eccAdd wrong answer');
    });
});