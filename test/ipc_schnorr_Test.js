const IPC = artifacts.require("IPC");
const utils = require("../utils")

contract('BN128.sol', (accounts) => {

    let Alice = {
        prikey: "0x2ef5962c7431dad9f1f98c74abf3b0cbda919941c40824ba89e3114e437ed7a3",
        pubkey: [
            '0x1c162371b7b9e9683c55e8375281b636703c784f5e92aa10a236bedafcf18dc4',
            '0xf61e49162d395bc4fc10a6ea9825f8fa826b30e542ea4976753c8e0ffd565f1'
        ]
    }
    let Bob = {
        prikey: "0xb2bde437e0e2a93a1022cfbcb7772942999160b32bee53428d9baacec4c5629",
        pubkey: [
            '0x2979386fff5e9cd65422bea3dd1072ff943e66f8f2132bb0cb67e679210016ae',
            '0x8dcc6f569a3f1df2f9bf2d98cd1386a9df0062357ad30d95215128a674ee140'
        ]
    }

    it(`Schnorr signature & verify`, async () => {
        const ipc = await IPC.deployed();

        // 待加密的消息，时间戳
        const M = 20220317;

        /**
         * @dev sigSchnorr
         * @notice 生成 schnorr 签名
         * @param sk    - 用户私钥
         * @param r     - 用户随机数
         * @param M     - 待签名消息 M
         * @return uint - c
         * @return uint - e
         */
        let SSig = await ipc.sigSchnorr.call(Alice.prikey, 666, M);
        const c = utils.bnToHex(SSig.c);
        const e = utils.bnToHex(SSig.e);
        
        // console.log({c, e});

        /**
         * @dev verifySchnorr
         * @notice 验证 schnorr 签名
         * @param c     -
         * @param e     - e = (r - c*sk) mod order
         * @param M     - Schnorr 签名：c，e，M
         * @param PK    - 用户公钥
         * @return uint - h
         * @return uint - ekey
         */
        const valid = await ipc.verifySchnorr.call(c, e, M, Alice.pubkey);
        const gas_schnorr_verify = await ipc.verifySchnorr.estimateGas(c, e, M, Alice.pubkey);
        console.log({gas_schnorr_verify});
        // console.log({valid});
        assert.equal(valid, true, 'Schnorr wrong answer');
    });

});