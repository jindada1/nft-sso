const DAMC = artifacts.require("DAMC");
const utils = require("../utils")

let DAID = "0xd1c993f56c197375f0a396cd08e45424f594a757fe1a309e104aeb5373007d23"
let DAURI = ""

contract('DAMC', (accounts) => {
    var result = []

    // it(`create`, async () => {
    //     const damc = await DAMC.deployed();
    //     for (let index = 0; index < 262; index++) {
    //         DAURI += "A"
    //     }
    //     for (let index = 0; index < 10; index++) {
    //         DAID = utils.sha256(DAID)
    //         let empty = await damc.empty.estimateGas();
    //         let Create = await damc.Create.estimateGas(DAID, DAURI);
    //         let safeMint = await damc.safeMint.estimateGas(DAID);
    //         await damc.safeMint(DAID);
    //         let setTokenURI = await damc.setTokenURI.estimateGas(DAID, DAURI);

    //         result.push({
    //             id: DAID.substring(0, 10),
    //             empty,
    //             Create_empty: Create - empty,
    //             safeMint_empty: safeMint - empty,
    //             setTokenURI_empty: setTokenURI - empty
    //         })
    //     }
    // });

    // it(`create`, async () => {
    //     const damc = await DAMC.deployed();
    //     let empty = await damc.empty.estimateGas();
    //     DAURI = ""
        
    //     for (let index = 0; index < 32; index++) {
    //         DAID = utils.sha256(DAID)
    //         await damc.safeMint(DAID);
    //         let setTokenURI = await damc.setTokenURI.estimateGas(DAID, DAURI);

    //         result.push({
    //             id: DAID.substring(0, 10),
    //             length: DAURI.length,
    //             setTokenURI: setTokenURI - empty
    //         })
    //         DAURI += "AAAAAAAA"
    //     }
    // });

    it(`query`, async () => {
        const damc = await DAMC.deployed();
        let empty = await damc.empty.estimateGas();
        DAURI = ""
        
        for (let index = 0; index < 32; index++) {
            DAID = utils.sha256(DAID)
            await damc.safeMint(DAID);
            await damc.setTokenURI.estimateGas(DAID, DAURI);
            let queryTokenURI = await damc.tokenURI.estimateGas(DAID);

            result.push({
                id: DAID.substring(0, 10),
                length: DAURI.length,
                queryTokenURI: queryTokenURI - empty
            })
            DAURI += "AAAAAAAA"
        }
    });

    after(`result`, async () => {
        console.table(result);
    });
});

/**
┌─────────┬──────────────┬────────┬───────────────┐
│ (index) │      id      │ length │ queryTokenURI │
├─────────┼──────────────┼────────┼───────────────┤
│    0    │ '0x4400bda1' │   0    │     6280      │
│    1    │ '0xbe0fc47f' │   8    │     6292      │
│    2    │ '0xa2a5da57' │   16   │     6292      │
│    3    │ '0xc7004541' │   24   │     6280      │
│    4    │ '0x1c5b0622' │   32   │     6292      │
│    5    │ '0x837437b9' │   40   │     6292      │
│    6    │ '0x87419a51' │   48   │     6292      │
│    7    │ '0x700b01e0' │   56   │     6292      │
│    8    │ '0x3e2dfdec' │   64   │     6292      │
│    9    │ '0xa861f0f0' │   72   │     6292      │
│   10    │ '0x618902a9' │   80   │     6292      │
│   11    │ '0x5da50912' │   88   │     6292      │
│   12    │ '0x988a50ff' │   96   │     6292      │
│   13    │ '0x57cb0194' │  104   │     6292      │
│   14    │ '0xe10bb22a' │  112   │     6292      │
│   15    │ '0xb2d7cca7' │  120   │     6292      │
│   16    │ '0x8aba7568' │  128   │     6292      │
│   17    │ '0xa216fec5' │  136   │     6292      │
│   18    │ '0x012ef752' │  144   │     6292      │
│   19    │ '0x43b93551' │  152   │     6292      │
│   20    │ '0xb4bfb3d5' │  160   │     6292      │
│   21    │ '0x56b4d388' │  168   │     6292      │
│   22    │ '0x0f8b03cf' │  176   │     6292      │
│   23    │ '0xb1830b8a' │  184   │     6280      │
│   24    │ '0x5a18c5ae' │  192   │     6292      │
│   25    │ '0xddabff90' │  200   │     6292      │
│   26    │ '0xb313d783' │  208   │     6292      │
│   27    │ '0x32ddac7d' │  216   │     6292      │
│   28    │ '0x842cb4ca' │  224   │     6292      │
│   29    │ '0x9ead9a06' │  232   │     6292      │
│   30    │ '0x8e0dbdd8' │  240   │     6292      │
│   31    │ '0x75aafb64' │  248   │     6292      │
└─────────┴──────────────┴────────┴───────────────┘
 */