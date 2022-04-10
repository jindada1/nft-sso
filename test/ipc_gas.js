const IPC = artifacts.require("IPC");
const utils = require("../utils")

contract('BN128.sol', (accounts) => {

    let Alice = {
        prikey: "0x2ef5962c7431dad9f1f98c74abf3b0cbda919941c40824ba89e3114e437ed7a3",
        pubkey: [
            "0x1c162371b7b9e9683c55e8375281b636703c784f5e92aa10a236bedafcf18dc4",
            "0xf61e49162d395bc4fc10a6ea9825f8fa826b30e542ea4976753c8e0ffd565f1"
        ]
    }
    let Bob = {
        prikey: "0xb2bde437e0e2a93a1022cfbcb7772942999160b32bee53428d9baacec4c5629",
        pubkey: [
            '0x2979386fff5e9cd65422bea3dd1072ff943e66f8f2132bb0cb67e679210016ae',
            '0x8dcc6f569a3f1df2f9bf2d98cd1386a9df0062357ad30d95215128a674ee140'
        ]
    }
    // 声明
    const D = "eyJleHAiOiAxNjUwODQ0ODAwfQ==";

    let R = [
        '0x1a01114fce4c287d8beb49616ca8f2c2be211820b73340c79bd4aada0c4f66af',
        '0x1bcbbb9c398c87dc504e9d275b6f5f97215a081a85d3161910158b4ab331f7bc'
    ]
    let s = '0x1dceae31f71547ababe099dd90cfce55434e900c5e7fc7605f6543f9d9fb8e96'

    let result = []

    // it(`IPC Storage`, async () => {
    //     const ipc = await IPC.deployed();
    //     let key = Alice.prikey;
    //     let costs = []
    //     let Declaration = ""
    //     for (let index = 0; index < 32; index++) {
    //         key = utils.sha256(key)
    //         let store = await ipc.store_declaration.estimateGas(key, Declaration);
    //         costs.push({
    //             length: Declaration.length,
    //             store: store - 21296,
    //         })
    //         Declaration += "ABBA"
    //     }
    //     console.table(costs)
    // });

    it(`IPC Query`, async () => {
        const ipc = await IPC.deployed();
        let key = Alice.prikey;
        let costs = []
        let Declaration = ""
        for (let index = 0; index < 32; index++) {
            key = utils.sha256(key)
            await ipc.store(key, D, s);
            const query = await ipc.Query.estimateGas(key);
            costs.push({
                length: Declaration.length,
                query: query - 21296,
            })
            Declaration += "ABBAABBA"
        }
        console.table(costs)
    });

    // it(`verify, hash, eccMul, eccAdd`, async () => {
    //     const ipc = await IPC.deployed();

    //     /**
    //      * @dev Login
    //      * @notice 调用者链上登录
    //      * @param s     -
    //      * @param R     -
    //      * @param UPK   - 用户公钥
    //      * @param D     - Schnorr 签名：s, R, UPK
    //      */
    //     const login = await ipc.Login.estimateGas(s, R, Alice.pubkey, D);
    //     /**
    //      * @dev verifySchnorr
    //      * @notice 验证 schnorr 签名
    //      * @param s     -
    //      * @param R     -
    //      * @param UPK   - 用户公钥
    //      * @param D     - Schnorr 签名：s, R, UPK, D
    //      * @return bool - valid 
    //      */
    //     const verify = await ipc.verifySchnorr.estimateGas(s, R, Alice.pubkey, D);

    //     const store = await ipc.store.estimateGas(Alice.prikey, D, s);
    //     const hash = await ipc.hash.estimateGas(Alice.pubkey, D);
    //     const eccMul = await ipc.eccMul.estimateGas(Alice.pubkey, Bob.prikey);
    //     const eccAdd = await ipc.eccAdd.estimateGas(Alice.pubkey, Bob.pubkey);
    //     const empty = await ipc.empty.estimateGas();

    //     result.push({
    //         empty,
    //         login: login - empty,
    //         store: store - empty,
    //         verify: verify - empty,
    //         eccAdd: eccAdd - empty,
    //         eccMul: eccMul - empty,
    //         hash: hash - empty
    //     })
    // });

    after(`result`, async () => {
        // console.table(result);
    });
});

/**
Store
┌─────────┬────────┬────────┐
│ (index) │ length │ store  │
├─────────┼────────┼────────┤
│    0    │   0    │  6113  │
│    1    │   4    │ 24137  │
│    2    │   8    │ 24173  │
│    3    │   12   │ 24233  │
│    4    │   16   │ 24281  │
│    5    │   20   │ 24329  │
│    6    │   24   │ 24377  │
│    7    │   28   │ 24413  │
│    8    │   32   │ 46676  │
│    9    │   36   │ 69028  │
│   10    │   40   │ 69076  │
│   11    │   44   │ 69124  │
│   12    │   48   │ 69172  │
│   13    │   52   │ 69220  │
│   14    │   56   │ 69268  │
│   15    │   60   │ 69316  │
│   16    │   64   │ 69364  │
│   17    │   68   │ 91704  │
│   18    │   72   │ 91764  │
│   19    │   76   │ 91812  │
│   20    │   80   │ 91860  │
│   21    │   84   │ 91908  │
│   22    │   88   │ 91956  │
│   23    │   92   │ 92004  │
│   24    │   96   │ 92052  │
│   25    │  100   │ 114404 │
│   26    │  104   │ 114452 │
│   27    │  108   │ 114500 │
│   28    │  112   │ 114536 │
│   29    │  116   │ 114596 │
│   30    │  120   │ 114644 │
│   31    │  124   │ 114692 │
└─────────┴────────┴────────┘
Query
┌─────────┬────────┬───────┐
│ (index) │ length │ query │
├─────────┼────────┼───────┤
│    0    │   0    │ 6222  │
│    1    │   8    │ 6222  │
│    2    │   16   │ 6210  │
│    3    │   24   │ 6222  │
│    4    │   32   │ 6222  │
│    5    │   40   │ 6222  │
│    6    │   48   │ 6222  │
│    7    │   56   │ 6210  │
│    8    │   64   │ 6222  │
│    9    │   72   │ 6222  │
│   10    │   80   │ 6222  │
│   11    │   88   │ 6222  │
│   12    │   96   │ 6222  │
│   13    │  104   │ 6222  │
│   14    │  112   │ 6222  │
│   15    │  120   │ 6222  │
│   16    │  128   │ 6222  │
│   17    │  136   │ 6210  │
│   18    │  144   │ 6222  │
│   19    │  152   │ 6222  │
│   20    │  160   │ 6222  │
│   21    │  168   │ 6222  │
│   22    │  176   │ 6222  │
│   23    │  184   │ 6222  │
│   24    │  192   │ 6222  │
│   25    │  200   │ 6222  │
│   26    │  208   │ 6222  │
│   27    │  216   │ 6222  │
│   28    │  224   │ 6210  │
│   29    │  232   │ 6222  │
│   30    │  240   │ 6222  │
│   31    │  248   │ 6222  │
└─────────┴────────┴───────┘
BN128
┌─────────┬───────┬───────┬───────┬────────┬────────┬────────┬──────┐
│ (index) │ empty │ login │ store │ verify │ eccAdd │ eccMul │ hash │
├─────────┼───────┼───────┼───────┼────────┼────────┼────────┼──────┤
│    0    │ 21296 │ 84948 │ 47387 │ 39485  │ 14179  │ 17878  │ 4099 │
└─────────┴───────┴───────┴───────┴────────┴────────┴────────┴──────┘
 */