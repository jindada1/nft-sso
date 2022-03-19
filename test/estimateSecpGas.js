const MainSecp = artifacts.require("MainSecp");
const utils = require("../utils")
const secp256k1 = require("../curves/secp256k1")
const Signer = require("../signencrypt").Signer

const signer = new Signer(secp256k1);


contract('MainSecp', (accounts) => {

    let Alice = secp256k1.keypair(utils.prikeys[0])
    let Bob = secp256k1.keypair(utils.prikeys[1])

    let r   = utils.randomBytes(32);
    let R   = secp256k1.drivePub(r)
    let M = utils.asciiToHex("Hello Bob")
    let ID_A = Alice.pubkey[0]
    let ID_B = Bob.pubkey[0]
    let w_A = Alice.prikey;
    let W_A = Alice.pubkey;
    let w_B = Bob.prikey
    let W_B = Bob.pubkey
    

    it(`drivePubkey`, async () => {

        const mainsecp = await MainSecp.deployed();

        const gasUsed = await mainsecp.drivePubkey.estimateGas(Alice.prikey);

        console.log(gasUsed);
    });

    
    it(`oneAndRightHalf`, async () => {

        const mainsecp = await MainSecp.deployed();

        let gasUsed = await mainsecp.oneAndRightHalf.estimateGas(Bob.prikey);
        
        console.log(gasUsed);
    });


    it(`ECCMul`, async () => {

        const mainsecp = await MainSecp.deployed();

        let gasUsed = await mainsecp.ECCMul.estimateGas(R, 10);
        
        console.log(gasUsed);
    });


    it(`ECCAdd`, async () => {

        const mainsecp = await MainSecp.deployed();

        let gasUsed = await mainsecp.ECCAdd.estimateGas(Alice.pubkey, Bob.pubkey);
        
        console.log(gasUsed);
    });


    it(`AliceK`, async () => {

        const mainsecp = await MainSecp.deployed();

        /**
         * @param uint256    r    - random number generated by Alice
         * @param uint256    w_A  - Alice's private key
         * @param uint256[2] W_B  - Bob's public key
         */
        const gasUsed = await mainsecp.AliceK.estimateGas(r, w_A, W_B);
        
        console.log(gasUsed);
    });


    it(`BobK`, async () => {

        const mainsecp = await MainSecp.deployed();

        /**
         * @param uint256[2] R    - signature
         * @param uint256[2] W_A  - Alice's public key
         * @param uint256    w_B  - Bob's private key
         */
        const gasUsed = await mainsecp.BobK.estimateGas(R, W_A, w_B);
        
        console.log(gasUsed);
    });
    

    it(`signCryption-sol`, async () => {

        const mainsecp = await MainSecp.deployed();

        /**
         * @param uint256    r    - random number generated by Alice
         * @param uint256    w_A  - Alice's private key
         * @param uint256    ID_A - Alice's unique identifiers
         * @param uint256    M    - message to be signcrypted
         * @param uint256[2] W_B  - Bob's public key
         * @param uint256    ID_B - Bob's unique identifiers
         */
        const gasUsed = await mainsecp.signCryption.estimateGas(r, w_A, ID_A, M, W_B, ID_B);
        
        console.log(gasUsed);
    });

    
    it('verifySignature-sol', async () => {

        const mainsecp = await MainSecp.deployed();

        /**
         * @param uint256    r    - random number generated by Alice
         * @param uint256    w_A  - Alice's private key
         * @param uint256    ID_A - Alice's unique identifiers
         * @param uint256    M    - message to be signcrypted
         * @param uint256[2] W_B  - Bob's public key
         * @param uint256    ID_B - Bob's unique identifiers
         */
        let {R, C, s} = signer.signCryption(r, w_A, ID_A, M, W_B, ID_B);
        // console.log({R, C, s});
        
        /**
         * @param R    - signature
         * @param C    - ciphertext
         * @param s    - signature
         * @param W_A  - Alice's public key
         * @param ID_A - Alice's unique identifiers
         * @param ID_B - Bob's unique identifiers
         */
        const gasUsed = await mainsecp.verifySignature.estimateGas(R, C, s, W_A, ID_A, ID_B);
        
        console.log(gasUsed);
    });


    it('unSignCryption-sol', async () => {

        const mainsecp = await MainSecp.deployed();

        /**
         * @param uint256    r    - random number generated by Alice
         * @param uint256    w_A  - Alice's private key
         * @param uint256    ID_A - Alice's unique identifiers
         * @param uint256    M    - message to be signcrypted
         * @param uint256[2] W_B  - Bob's public key
         * @param uint256    ID_B - Bob's unique identifiers
         */
        let {R, C, s} = signer.signCryption(r, w_A, ID_A, M, W_B, ID_B);
        // console.log({R, C, s});
        
        /**
         * @param uint256[2] R    - signature
         * @param uint256    C    - ciphertext
         * @param uint256    s    - signature
         * @param uint256[2] W_A  - Alice's public key
         * @param uint256    ID_A - Alice's unique identifiers
         * @param uint256    w_B  - Bob's private key
         * @param uint256    ID_B - Bob's unique identifiers
         */
        const gasUsed = await mainsecp.unSignCryption.estimateGas(R, C, s, W_A, ID_A, w_B, ID_B);
                
        console.log(gasUsed);
    });


    /*
        748047
            √ drivePubkey (2947ms)
            
        22276
            √ oneAndRightHalf (154ms)

        65459
            √ ECCMul (290ms)

        64640
            √ ECCAdd (265ms)

        1414806
            √ AliceK (4928ms)

        1060954
            √ BobK (3962ms)

        2081899
            √ signCryption-sol (7368ms)

        1383409
            √ sverifySignature-sol (7078ms)

        2410737
            √ unSignCryption-sol (11009ms)
    */
});