const IPC_Secp = artifacts.require("IPC_Secp");

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

    let s = '0x1dceae31f71547ababe099dd90cfce55434e900c5e7fc7605f6543f9d9fb8e96'

    let result = []

    it(`verify, hash, eccMul, eccAdd`, async () => {
        const ipc = await IPC_Secp.deployed();

        const store = await ipc.store.estimateGas(Alice.prikey, D, s);
        const hash = await ipc.hash.estimateGas(Alice.pubkey, D);
        const eccMul = await ipc.eccMul.estimateGas(Alice.pubkey, Bob.prikey);
        const eccAdd = await ipc.eccAdd.estimateGas(Alice.pubkey, Bob.pubkey);
        const empty = await ipc.empty.estimateGas();

        result.push({
            empty,
            store: store - empty,
            eccAdd: eccAdd - empty,
            eccMul: eccMul - empty,
            hash: hash - empty
        })
    });

    after(`result`, async () => {
        console.table(result);
    });
});

/**
Secp256K1
┌─────────┬───────┬───────┬────────┬────────┬──────┐
│ (index) │ empty │ store │ eccAdd │ eccMul │ hash │
├─────────┼───────┼───────┼────────┼────────┼──────┤
│    0    │ 21274 │ 47387 │ 47147  │ 354919 │ 4099 │
└─────────┴───────┴───────┴────────┴────────┴──────┘
 */