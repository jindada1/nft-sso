pragma solidity ^0.5.17;

library BN128 {
    // p = p(u) = 36u^4 + 36u^3 + 24u^2 + 6u + 1
    uint256 internal constant FIELD_ORDER = 0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47;

    // Number of elements in the field (often called `q`)
    // n = n(u) = 36u^4 + 36u^3 + 18u^2 + 6u + 1
    uint256 internal constant GEN_ORDER = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001;

    uint256 internal constant CURVE_B = 3;

    // a = (p+1) / 4
    uint256 internal constant CURVE_A = 0xc19139cb84c680a6e14116da060561765e05aa45a1c72a34f082305b61f3f52;

    struct G1Point {
        uint256 X;
        uint256 Y;
    }

    // (P+1) / 4
    function A() internal pure returns (uint256) {
        return CURVE_A;
    }

    function P() internal pure returns (uint256) {
        return FIELD_ORDER;
    }

    function N() internal pure returns (uint256) {
        return GEN_ORDER;
    }

    /// @return the generator of G1
    function P1() internal pure returns (G1Point memory) {
        return G1Point(1, 2);
    }

    function HashToPoint(uint256 s) internal view returns (G1Point memory) {
        uint256 beta = 0;
        uint256 y = 0;

        // XXX: Gen Order (n) or Field Order (p) ?
        uint256 x = s % GEN_ORDER;

        while (true) {
            (beta, y) = FindYforX(x);

            // y^2 == beta
            if (beta == mulmod(y, y, FIELD_ORDER)) {
                return G1Point(x, y);
            }

            x = addmod(x, 1, FIELD_ORDER);
        }
    }

    /**
     * Given X, find Y
     *   where y = sqrt(x^3 + b)
     *
     * Returns: (x^3 + b), y
     */
    function FindYforX(uint256 x) internal view returns (uint256, uint256) {
        // beta = (x^3 + b) % p
        uint256 beta = addmod(
            mulmod(mulmod(x, x, FIELD_ORDER), x, FIELD_ORDER),
            CURVE_B,
            FIELD_ORDER
        );

        // y^2 = x^3 + b
        // this acts like: y = sqrt(beta)
        uint256 y = expMod(beta, CURVE_A, FIELD_ORDER);

        return (beta, y);
    }

    // a - b = c;
    function submod(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 a_nn;

        if (a > b) {
            a_nn = a;
        } else {
            a_nn = a + GEN_ORDER;
        }

        return addmod(a_nn - b, 0, GEN_ORDER);
    }

    function expMod(
        uint256 _base,
        uint256 _exponent,
        uint256 _modulus
    ) internal view returns (uint256 retval) {
        bool success;
        uint256[1] memory output;
        uint256[6] memory input;
        input[0] = 0x20; // baseLen = new(big.Int).SetBytes(getData(input, 0, 32))
        input[1] = 0x20; // expLen  = new(big.Int).SetBytes(getData(input, 32, 32))
        input[2] = 0x20; // modLen  = new(big.Int).SetBytes(getData(input, 64, 32))
        input[3] = _base;
        input[4] = _exponent;
        input[5] = _modulus;
        assembly {
            success := staticcall(sub(gas, 2000), 5, input, 0xc0, output, 0x20)
            // Use "invalid" to make gas estimation work
            // switch success case 0 { invalid }
        }
        require(success);
        return output[0];
    }

    /// @return the negation of p, i.e. p.add(p.negate()) should be zero.
    function g1neg(G1Point memory p) internal pure returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint256 q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0) return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }

    /// @return the sum of two points of G1
    function g1add(G1Point memory p1, G1Point memory p2)
        internal
        view
        returns (G1Point memory r)
    {
        uint256[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas, 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            // switch success case 0 { invalid }
        }
        require(success);
    }

    /// @return the product of a point on G1 and a scalar, i.e.
    /// p == p.mul(1) and p.add(p) == p.mul(2) for all points p.
    function g1mul(G1Point memory p, uint256 s)
        internal
        view
        returns (G1Point memory r)
    {
        uint256[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas, 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            // switch success case 0 { invalid }
        }
        require(success);
    }

    // (a * b)  mod order
    function ECCMulMod(uint256 a, uint256 b) public pure returns (uint256) {
        return mulmod(a, b, GEN_ORDER);
    }

    // (a - b)  mod order
    function ECCSubMod(uint256 a, uint256 b) public pure returns (uint256) {
        return submod(a, b);
    }

    // 椭圆曲线上的乘法
    function ECCPub(uint256 prikey)
        public
        view
        returns (uint256[2] memory)
    {
        prikey = addmod(prikey, 0, GEN_ORDER);
        G1Point memory PK = g1mul(P1(), prikey);
        return [PK.X, PK.Y];
    }

    // 椭圆曲线上的乘法
    function ECCMul(uint256[2] memory PP, uint256 n)
        public
        view
        returns (uint256[2] memory R)
    {
        n = addmod(n, 0, GEN_ORDER);
        G1Point memory Point_R = g1mul(G1Point(PP[0], PP[1]), n);
        R = [Point_R.X, Point_R.Y];
    }

    // 椭圆曲线上的加法
    function ECCAdd(uint256[2] memory PP1, uint256[2] memory PP2)
        public
        view
        returns (uint256[2] memory R)
    {
        G1Point memory Point_R = g1add(G1Point(PP1[0], PP1[1]), G1Point(PP2[0], PP2[1]));
        R = [Point_R.X, Point_R.Y];
    }
}
