
const secp256k1 = require("noble-secp256k1");


/**
 * Should be called to get public key associated with input private key using 'Secp256k1' elliptic curve
 *
 * @method drivePub
 * @param {String} prikey input private key
 * @returns {Array} hex representation of pubkey.x + pubkey.y
 */
const drivePub = function (prikey) {
    if (prikey.startsWith('0x')) {
        prikey = prikey.slice(2);
    }
    var keyPoint = secp256k1.Point.fromPrivateKey(prikey)
    
    var x = keyPoint.x.toString(16).padStart(64, '0');
    var y = keyPoint.y.toString(16).padStart(64, '0');

    return ["0x" + x, "0x" + y];
};


/**
 * Add two points on elliptic curve (secp256k1)
 *
 * @method addPoints
 * @param {Array} p1 [x: hexStr, y: hexStr]
 * @param {Array} p2 [x: hexStr, y: hexStr]
 * @returns {Array}  [x: hexStr, y: hexStr]
 */
const addPoints = function (p1, p2) {
    let SP1 = new secp256k1.Point(...p1.map(BigInt));
    let SP2 = new secp256k1.Point(...p2.map(BigInt));

    let pkStr = SP1.add(SP2).toHex();
    return [
        "0x" + pkStr.slice(2, 66),
        "0x" + pkStr.slice(66, 130),
    ]
};


/**
 * Multiply point on elliptic curve (secp256k1) with a number
 *
 * @method mulPoint
 * @param {Array} p1 [x: hexStr, y: hexStr]
 * @param {String} n hexStr
 * @returns {Array}  [x: hexStr, y: hexStr]
 */
const mulPoint = function (p1, n) {
    let SP1 = new secp256k1.Point(...p1.map(BigInt))

    let pkStr = SP1.multiply(BigInt(n)).toHex();
    return [
        "0x" + pkStr.slice(2, 66),
        "0x" + pkStr.slice(66, 130),
    ]
};


/**
 * a mod b
 *
 * @method mod
 * @param {BigInt} a hex string
 * @param {BigInt} b hex string
 * @returns {String}  hex string
 */
 const mod = function (a, b = secp256k1.CURVE.n) {
    // remove negative
    if (a < 0) {
        a = a + BigInt(b)
    }

    return "0x" + (a % BigInt(b)).toString(16);
};


module.exports = {
    drivePub,
    mulPoint,
    addPoints,
    eccAddHex: (n1, n2) => mod(BigInt(n1) + BigInt(n2)),
    eccMulHex: (n1, n2) => mod(BigInt(n1) * BigInt(n2)),
    eccSubHex: (n1, n2) => mod(BigInt(n1) - BigInt(n2)),
    keypair: (prikey) => {
        return {
            prikey,
            pubkey: drivePub(prikey)
        }
    }
};