// TODO:

/**
 * a mod b
 *
 * @method mod
 * @param {BigInt} a hex string
 * @param {String} b hex string
 * @returns {String}  hex string
 */
 const mod = function (a, b = "0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001") {
    // remove negative
    if (a < 0) {
        a = a + BigInt(b)
    }

    return "0x" + (a % BigInt(b)).toString(16);
};


module.exports = {
    eccAddHex: (n1, n2) => mod(BigInt(n1) + BigInt(n2)),
    eccMulHex: (n1, n2) => mod(BigInt(n1) * BigInt(n2)),
    eccSubHex: (n1, n2) => mod(BigInt(n1) - BigInt(n2)),
    keypair: (prikey) => {
        return {
            prikey: mod(BigInt(prikey)),
            pubkey: "emmmm"
        }
    }
};