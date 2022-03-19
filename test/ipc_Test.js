const IPC = artifacts.require("IPC");
const utils = require("../utils")

contract('BN128.sol', (accounts) => {

    let Alice = {
        prikey: "0x2ef5962c7431dad9f1f98c74abf3b0cbda919941c40824ba89e3114e437ed7a3",
        pubkey: ["0x1c162371b7b9e9683c55e8375281b636703c784f5e92aa10a236bedafcf18dc4", "0xf61e49162d395bc4fc10a6ea9825f8fa826b30e542ea4976753c8e0ffd565f1"]
    }
    let Bob = {
        prikey: "0xb2bde437e0e2a93a1022cfbcb7772942999160b32bee53428d9baacec4c5629",
        pubkey: [
            '0x2979386fff5e9cd65422bea3dd1072ff943e66f8f2132bb0cb67e679210016ae',
            '0x8dcc6f569a3f1df2f9bf2d98cd1386a9df0062357ad30d95215128a674ee140'
        ]
    }

    it(`IPC Issue digtal credential for Alice`, async () => {
        const ipc = await IPC.deployed();

        // 待加密的消息，时间戳
        const M = 20220317;
        const c = '0x93375696a9be5b7a497a49fee6453647311e4f5b8b40db026148dc930c600fa5';
        const e = '0xf7f1b80810d15f18ee8b7c944df28742b6beb4a492159ff53976bf58acc658';
        
        /**
         * @dev Issue
         * @notice 为调用者颁发凭证
         * @param c     -
         * @param e     -
         * @param M     - Schnorr 签名：c，e，M
         * @param UPK   - 用户公钥
         * @return uint256    - h
         * @return uint256[2] - Rkey
         */
        let DC = await ipc.Issue.call(c, e, M, Alice.pubkey);
        const h = utils.bnToHex(DC.h)
        const Rkey = DC.Rkey.map(utils.bnToHex)

        // 之前仅仅只调用 call 的话不会真的发送交易改变状态，即 mapping 不会变
        await ipc.Issue(c, e, M, Alice.pubkey);

        // Alice 计算共享密钥 key
        let alice_key = await ipc.eccMul(Rkey, Alice.prikey);
        let key = (alice_key.map(utils.bnToHex))[0]
        // 根据共享密钥计算元信息密钥 k
        let k = await ipc.hash(Alice.pubkey, key);
        k = utils.bnToHex(k)
        // console.log({key, h, k});

        //  用户凭证
        //  key = '0x2c74ce9fe47394a585acb50c7e8541d9f875867102e0114b682ce9795fd77dcc'
        //  h = '0x4cb9f194ec4caffaaadc80e43f852dd61ec4dcc56b19d7de4c2e25df7833ff21'
        //  k = '0x8f86578d69527b649fb6f7e3bf31a5ccfc8d9b5dea363b6f5b48ca3bc06e811'

        /**
         * @dev Verify
         * @notice 验证来自客户端的凭证
         * @param h     -
         * @param k     -
         * @param EDAID - Schnorr 签名：c，e，M
         * @param PPK   - 平台公钥
         * @return uint256    - DAID
         */

        // 选择一个加密后的 NFT
        let DAID = "0x7232425";
        let EDAID = utils.encrypt(DAID, key)

        // 登录验证
        let SUID = await ipc.Verify.call(h, k, EDAID, Bob.pubkey);
        SUID = utils.bnToHex(SUID);

        assert.equal(SUID, DAID, 'verify success');
    });
});