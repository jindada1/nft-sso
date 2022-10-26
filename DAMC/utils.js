var crypto = require("crypto");

const prikeys = [
    "0xf086cff7f8f85b80d33aa34eb1f912407b613a63aaede6ff996ae79e037ed7a7",
    "0xccbd180f02d4ab3a824343d5d17cd408ca68b72d19a4a779386190fcac4c562d",
    "0xb99a4547a5c9a8e0af80b773ad0845042f2a781658289f1df05ea45e3ce25b0d",
    "0x7420c9c0b000b315908b7c41aa40c3f16f93a723b0ecd1749f27b7967ff04051",
    "0x2515b67a2cb7620c5a739807000afd585f0e5af966c69c2b8482e76caae71c77",
    "0x483c09f1534f19d3cb36a7190ac416d335387512eb24435b50e27a0d6f813f8b",
    "0x476937255b66dde9b1b9041364534da3770626cdbff3f1e11fee7f2f5a1e63e1",
    "0x5ff0422bd4e1573016d3c368bab8f0f4713c80e8807ee917ce59ff513a723c64",
    "0x5435a572d7c6bf2c1b016ba47d666fd98e7fdd07a123312fcf88ba1a67a9081c",
    "0xf822ccafd7e18820953aa71189b95b8e6f04d8e7be522a81c6f65a1e03d6f821",
]

/**
 * Should be called to get hex representation (prefixed by 0x) of ascii string
 *
 * @method asciiToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
const asciiToHex = function (str) {
    if (!str)
        return "0x00";
    var hex = "";
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }

    return "0x" + hex;
};

/**
 * Should be called to get hex representation (prefixed by 0x) of decimal number string
 *
 * @method decToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
const decToHex = function (str) {
    var dec = str.toString().split(''), sum = [], hex = ["0x"], i, s
    while (dec.length) {
        s = 1 * dec.shift()
        for (i = 0; s || i < sum.length; i++) {
            s += (sum[i] || 0) * 10
            sum[i] = s % 16
            s = (s - sum[i]) / 16
        }
    }
    while (sum.length) {
        hex.push(sum.pop().toString(16))
    }
    return hex.join('')
}

/**
 * Generate random bytes and format to hex
 *
 * @method randomBytes
 * @param {Number} byteLen byte length of random hex string
 * @returns {String} hex string
 */
const randomBytes = function (byteLen = 32) {
    var hex = crypto.randomBytes(byteLen).toString('hex');
    return "0x" + hex;
};


keccak256 = require('js-sha3').keccak256;

/**
 * Convert a hex string to an ArrayBuffer.
 * https://gist.github.com/don/871170d88cf6b9007f7663fdbc23fe09
 * 
 * @param {string} hexString - hex representation of bytes.
 * @return {Array} - Array of integers.
 */
function hexStringToArray(hexString) {
    // remove the leading 0x
    hexString = hexString.replace(/^0x/, '');

    // ensure even number of characters
    if (hexString.length % 2 != 0) {
        console.log('WARNING: expecting an even number of characters in the hexString');
    }

    // check for some non-hex characters
    var bad = hexString.match(/[G-Z\s]/i);
    if (bad) {
        console.log('WARNING: found non-hex characters', bad);
    }

    // split the string into pairs of octets
    var pairs = hexString.match(/[\dA-F]{2}/gi);

    // convert the octets to integers
    return pairs.map((s) => parseInt(s, 16));

}


/**
 * Keccak256 hash function
 *
 * @method keccak256Hash
 * @param {Array} hex array of hex Str
 * @returns {String}  hexStr, 0x------
 */
const keccak256Hash = function (hexes) {
    let integers = []

    for (const hex of hexes) {
        integers = integers.concat(hexStringToArray(hex))
    }
    
    return "0x" + keccak256(new Uint8Array(integers));
};


/**
 * xor message with key
 *
 * @method XOR
 * @param {String} msg hex message
 * @param {String} key hex string
 * @returns {String}  hex string
 */
const XOR = function (msg, key) {
    const msgBuf = Buffer.from(msg.slice(2).padStart(64, '0'), 'hex');
    const keyBuf = Buffer.from(key.slice(2), 'hex');

    const resultBuf = keyBuf.map((bit, i) => bit ^ msgBuf[i]);

    return "0x" + BigInt("0x" + resultBuf.toString('hex')).toString(16);
};


const sha256 = function sha256(data) {
    return "0x" + crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
    prikeys,
    sha256,
    decToHex,
    asciiToHex,
    randomBytes,
    keccak256Hash,

    encrypt: XOR,
    decrypt: XOR,

    bnToHex: (bn) => decToHex(bn.toString()),
    oneAndRightHalf: (str) => "0x1" + str.slice(34),
};