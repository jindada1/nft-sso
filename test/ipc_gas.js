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
        let gas_issue = await ipc.Issue.estimateGas(c, e, M, Alice.pubkey);
        console.log({gas_issue});

        let transaction = await ipc.Issue(c, e, M, Alice.pubkey);
        console.log(transaction.receipt.gasUsed);
    });


    it(`IPC Verify digtal credential for Alice`, async () => {
        const ipc = await IPC.deployed();

        //  用户凭证
        const key = '0x2c74ce9fe47394a585acb50c7e8541d9f875867102e0114b682ce9795fd77dcc'
        const h = '0x4cb9f194ec4caffaaadc80e43f852dd61ec4dcc56b19d7de4c2e25df7833ff21'
        const k = '0x8f86578d69527b649fb6f7e3bf31a5ccfc8d9b5dea363b6f5b48ca3bc06e811'

        // 选择一个加密后的 NFT
        let DAID = "0x7232425";
        let EDAID = utils.encrypt(DAID, key)

        let gas_readec = await ipc.ec.estimateGas(h);
        console.log({gas_readec});

        /**
         * @dev Verify
         * @notice 验证来自客户端的凭证
         * @param h     -
         * @param k     -
         * @param EDAID - Schnorr 签名：c，e，M
         * @param PPK   - 平台公钥
         * @return uint256    - DAID
         */
        let gas_verify = await ipc.Verify.estimateGas(h, k, EDAID, Bob.pubkey);
        console.log({gas_verify});
    });

    
    it(`Schnorr verify`, async () => {
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
        const gas_schnorr_verify = await ipc.verifySchnorr.estimateGas(c, e, M, Alice.pubkey);
        console.log({gas_schnorr_verify});
    });
    

    it(`hash`, async () => {
        const ipc = await IPC.deployed();

        const gas_hash = await ipc.hash.estimateGas(Alice.pubkey, Bob.prikey);
        console.log({gas_hash});
    });
    

    it(`eccMul`, async () => {
        const sol_bn128 = await IPC.deployed();

        let gas_eccMul = await sol_bn128.eccMul.estimateGas(Alice.pubkey, Bob.prikey);
        console.log({gas_eccMul});
    });

    
    it(`eccAdd`, async () => {
        const sol_bn128 = await IPC.deployed();

        let G10 = await sol_bn128.eccPub(10);
        G10 = G10.map(utils.bnToHex)
        let gas_eccAdd = await sol_bn128.eccAdd.estimateGas(Alice.pubkey, G10);
        console.log({gas_eccAdd});
    });


    it(`encode & decode`, async () => {
        const ipc = await IPC.deployed();
        // 待加密的消息，时间戳
        const M = 20220317;

        const gas_encode = await ipc.encode.estimateGas(Alice.pubkey, Bob.prikey, M);
        console.log({gas_encode});

        const encoded = await ipc.encode(Alice.pubkey, Bob.prikey, M);
        // console.log(encoded);

        const gas_decode = await ipc.decode.estimateGas(encoded);
        console.log({gas_decode});
    });


    it(`encrypt & decrypt`, async () => {
        const ipc = await IPC.deployed();
        // 待加密的消息，时间戳
        const M = 20220317;

        const encoded = await ipc.encode(Alice.pubkey, Bob.prikey, M);

        const gas_encrypt = await ipc.encrypt.estimateGas(encoded, 1234);
        console.log({gas_encrypt});

        const gas_decrypt = await ipc.encrypt.estimateGas(encoded, 1234);
        console.log({gas_decrypt});
    });


    it(`empty`, async () => {
        const ipc = await IPC.deployed();
        
        const gas_empty = await ipc.empty.estimateGas();
        console.log({gas_empty});
    });

});