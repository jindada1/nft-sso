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
    let r = 333

    it(`Schnorr signature & verify`, async () => {
        const ipc = await IPC.deployed();

        // 待签名的声明
        const D = "eyJleHAiOiAxNjUwODQ0ODAwfQ==";

        /**
         * @dev sigSchnorr
         * @notice 生成 schnorr 签名
         * @param sk    - 用户私钥
         * @param r     - 用户随机数
         * @param D     - 待签名消息 D
         * @return uint256[2] - R
         * @return uint256    - s
         */
        let SSig = await ipc.sigSchnorr.call(Alice.prikey, r, D);
        const R = SSig.R.map(utils.bnToHex);
        const s = utils.bnToHex(SSig.s);
        console.log({R, s});

        /**
         * @dev verifySchnorr
         * @notice 验证 schnorr 签名
         * @param s     -
         * @param R     -
         * @param UPK   - 用户公钥
         * @param D     - Schnorr 签名：s, R, UPK, D
         * @return bool - valid 
         */
        const valid = await ipc.verifySchnorr.call(s, R, Alice.pubkey, D);

        assert.equal(valid, true, 'Schnorr wrong answer');
    });

});