pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;
/*
Taken from https://github.com/jbaylina/ecsol and https://github.com/1Address/ecsol

License: GPL-3.0
*/

contract Secp256k1 {

    uint256 constant public gx = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint256 constant public gy = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
    uint256 constant public n = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;
    uint256 constant public GEN_ORDER = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141;
    uint256 constant public a = 0;
    uint256 constant public b = 7;

    struct G1Point {
        uint256 X;
        uint256 Y;
    }
    
    function P1()  public pure returns (G1Point memory) {
        return G1Point(gx, gy);
    }
    function N()  public pure returns (uint256) {
        return GEN_ORDER;
    }
    function g1mul(G1Point memory p, uint s)  public pure returns (G1Point memory r) {        
        uint256 x;
        uint256 y;
        
        (x,y)=ecmul(p.X, p.Y, s);
        return G1Point(x,y);
    }

    function g1add(G1Point memory p1, G1Point memory p2)  public pure returns (G1Point memory r) {
        uint256 x3;
        uint256 y3;
        (x3, y3) = ecadd(p1.X, p1.Y, p2.X, p2.Y);
        
        return G1Point(x3,y3);
    }

    function submod(uint x, uint y) public pure returns (uint){
        uint x_nn;

        if(x > y) {
            x_nn = x;
        } else {
            x_nn = x + GEN_ORDER;
        }

        return addmod(x_nn - y, 0, GEN_ORDER);
    }

    function g1mul2(G1Point memory p, uint _k) public pure returns (G1Point memory r) {        
        uint256 _x=p.X;
        uint256 _y=p.Y;
        uint256 _aa=a;
        uint256 _pp=n;
        // Jacobian multiplication
        (uint256 x1, uint256 y1, uint256 z1) = jacMul(
          _k,
          _x,
          _y,
          1,
          _aa,
          _pp);
        // Get back to affine
        (uint256 x, uint256 y)=toAffine(
          x1,
          y1,
          z1,
          _pp);
        return G1Point(x,y);
      }
    function toAffine(
        uint256 _x,
        uint256 _y,
        uint256 _z,
        uint256 _pp)
      internal pure returns (uint256, uint256)
      {
        uint256 zInv = invMod(_z, _pp);
        uint256 zInv2 = mulmod(zInv, zInv, _pp);
        uint256 x2 = mulmod(_x, zInv2, _pp);
        uint256 y2 = mulmod(_y, mulmod(zInv, zInv2, _pp), _pp);

        return (x2, y2);
      }
    function invMod(uint256 _x, uint256 _pp) internal pure returns (uint256) {
        require(_x != 0 && _x != _pp && _pp != 0, "Invalid number");
        uint256 q = 0;
        uint256 newT = 1;
        uint256 r = _pp;
        uint256 t;
        while (_x != 0) {
          t = r / _x;
          (q, newT) = (newT, addmod(q, (_pp - mulmod(t, newT, _pp)), _pp));
          (r, _x) = (_x, r - t * _x);
        }

        return q;
      }

    function jacMul(
        uint256 _d,
        uint256 _x,
        uint256 _y,
        uint256 _z,
        uint256 _aa,
        uint256 _pp)
      internal pure returns (uint256, uint256, uint256)
      {
        // Early return in case that `_d == 0`
        if (_d == 0) {
          return (_x, _y, _z);
        }

        uint256 remaining = _d;
        uint256 qx = 0;
        uint256 qy = 0;
        uint256 qz = 1;

        // Double and add algorithm
        while (remaining != 0) {
          if ((remaining & 1) != 0) {
            (qx, qy, qz) = jacAdd(
              qx,
              qy,
              qz,
              _x,
              _y,
              _z,
              _pp);
          }
          remaining = remaining / 2;
          (_x, _y, _z) = jacDouble(
            _x,
            _y,
            _z,
            _aa,
            _pp);
        }
        return (qx, qy, qz);
      }

      function jacAdd(
    uint256 _x1,
    uint256 _y1,
    uint256 _z1,
    uint256 _x2,
    uint256 _y2,
    uint256 _z2,
    uint256 _pp)
  internal pure returns (uint256, uint256, uint256)
  {
    if (_x1==0 && _y1==0)
      return (_x2, _y2, _z2);
    if (_x2==0 && _y2==0)
      return (_x1, _y1, _z1);

    // We follow the equations described in https://pdfs.semanticscholar.org/5c64/29952e08025a9649c2b0ba32518e9a7fb5c2.pdf Section 5
    uint[4] memory zs; // z1^2, z1^3, z2^2, z2^3
    zs[0] = mulmod(_z1, _z1, _pp);
    zs[1] = mulmod(_z1, zs[0], _pp);
    zs[2] = mulmod(_z2, _z2, _pp);
    zs[3] = mulmod(_z2, zs[2], _pp);

    // u1, s1, u2, s2
    zs = [
      mulmod(_x1, zs[2], _pp),
      mulmod(_y1, zs[3], _pp),
      mulmod(_x2, zs[0], _pp),
      mulmod(_y2, zs[1], _pp)
    ];

    // In case of zs[0] == zs[2] && zs[1] == zs[3], double function should be used
    require(zs[0] != zs[2] || zs[1] != zs[3], "Use jacDouble function instead");

    uint[4] memory hr;
    //h
    hr[0] = addmod(zs[2], _pp - zs[0], _pp);
    //r
    hr[1] = addmod(zs[3], _pp - zs[1], _pp);
    //h^2
    hr[2] = mulmod(hr[0], hr[0], _pp);
    // h^3
    hr[3] = mulmod(hr[2], hr[0], _pp);
    // qx = -h^3  -2u1h^2+r^2
    uint256 qx = addmod(mulmod(hr[1], hr[1], _pp), _pp - hr[3], _pp);
    qx = addmod(qx, _pp - mulmod(2, mulmod(zs[0], hr[2], _pp), _pp), _pp);
    // qy = -s1*z1*h^3+r(u1*h^2 -x^3)
    uint256 qy = mulmod(hr[1], addmod(mulmod(zs[0], hr[2], _pp), _pp - qx, _pp), _pp);
    qy = addmod(qy, _pp - mulmod(zs[1], hr[3], _pp), _pp);
    // qz = h*z1*z2
    uint256 qz = mulmod(hr[0], mulmod(_z1, _z2, _pp), _pp);
    return(qx, qy, qz);
  }

  /// @dev Doubles a points (x, y, z).
  /// @param _x coordinate x of P1
  /// @param _y coordinate y of P1
  /// @param _z coordinate z of P1
  /// @param _aa the a scalar in the curve equation
  /// @param _pp the modulus
  /// @return (qx, qy, qz) 2P in Jacobian
  function jacDouble(
    uint256 _x,
    uint256 _y,
    uint256 _z,
    uint256 _aa,
    uint256 _pp)
  internal pure returns (uint256, uint256, uint256)
  {
    if (_z == 0)
      return (_x, _y, _z);

    // We follow the equations described in https://pdfs.semanticscholar.org/5c64/29952e08025a9649c2b0ba32518e9a7fb5c2.pdf Section 5
    // Note: there is a bug in the paper regarding the m parameter, M=3*(x1^2)+a*(z1^4)
    // x, y, z at this point represent the squares of _x, _y, _z
    uint256 x = mulmod(_x, _x, _pp); //x1^2
    uint256 y = mulmod(_y, _y, _pp); //y1^2
    uint256 z = mulmod(_z, _z, _pp); //z1^2

    // s
    uint s = mulmod(4, mulmod(_x, y, _pp), _pp);
    // m
    uint m = addmod(mulmod(3, x, _pp), mulmod(_aa, mulmod(z, z, _pp), _pp), _pp);

    // x, y, z at this point will be reassigned and rather represent qx, qy, qz from the paper
    // This allows to reduce the gas cost and stack footprint of the algorithm
    // qx
    x = addmod(mulmod(m, m, _pp), _pp - addmod(s, s, _pp), _pp);
    // qy = -8*y1^4 + M(S-T)
    y = addmod(mulmod(m, addmod(s, _pp - x, _pp), _pp), _pp - mulmod(8, mulmod(y, y, _pp), _pp), _pp);
    // qz = 2*y1*z1
    z = mulmod(2, mulmod(_y, _z, _pp), _pp);

    return (x, y, z);
  }



    function _jAdd(
        uint256 x1, uint256 z1,
        uint256 x2, uint256 z2)
        public 
        pure
        returns(uint256 x3, uint256 z3)
    {
        (x3, z3) = (
            addmod(
                mulmod(z2, x1, n),
                mulmod(x2, z1, n),
                n
            ),
            mulmod(z1, z2, n)
        );
    }


    function _jSub(
        uint256 x1, uint256 z1,
        uint256 x2, uint256 z2)
        public 
        pure
        returns(uint256 x3, uint256 z3)
    {
        (x3, z3) = (
            addmod(
                mulmod(z2, x1, n),
                mulmod(n - x2, z1, n),
                n
            ),
            mulmod(z1, z2, n)
        );
    }

    function _jMul(
        uint256 x1, uint256 z1,
        uint256 x2, uint256 z2)
        public 
        pure
        returns(uint256 x3, uint256 z3)
    {
        (x3, z3) = (
            mulmod(x1, x2, n),
            mulmod(z1, z2, n)
        );
    }

    function _jDiv(
        uint256 x1, uint256 z1,
        uint256 x2, uint256 z2) 
        public 
        pure
        returns(uint256 x3, uint256 z3)
    {
        (x3, z3) = (
            mulmod(x1, z2, n),
            mulmod(z1, x2, n)
        );
    }

    function _inverse(uint256 val) public pure
        returns(uint256 invVal)
    {
        uint256 t = 0;
        uint256 newT = 1;
        uint256 r = n;
        uint256 newR = val;
        uint256 q;
        while (newR != 0) {
            q = r / newR;

            (t, newT) = (newT, addmod(t, (n - mulmod(q, newT, n)), n));
            (r, newR) = (newR, r - q * newR );
        }

        return t;
    }

    function _ecAdd(
        uint256 x1, uint256 y1, uint256 z1,
        uint256 x2, uint256 y2, uint256 z2) 
        public 
        pure
        returns(uint256 x3, uint256 y3, uint256 z3)
    {
        uint256 lx;
        uint256 lz;
        uint256 da;
        uint256 db;

        if (x1 == 0 && y1 == 0) {
            return (x2, y2, z2);
        }

        if (x2 == 0 && y2 == 0) {
            return (x1, y1, z1);
        }

        if (x1 == x2 && y1 == y2) {
            (lx, lz) = _jMul(x1, z1, x1, z1);
            (lx, lz) = _jMul(lx, lz, 3, 1);
            (lx, lz) = _jAdd(lx, lz, a, 1);

            (da,db) = _jMul(y1, z1, 2, 1);
        } else {
            (lx, lz) = _jSub(y2, z2, y1, z1);
            (da, db) = _jSub(x2, z2, x1, z1);
        }

        (lx, lz) = _jDiv(lx, lz, da, db);

        (x3, da) = _jMul(lx, lz, lx, lz);
        (x3, da) = _jSub(x3, da, x1, z1);
        (x3, da) = _jSub(x3, da, x2, z2);

        (y3, db) = _jSub(x1, z1, x3, da);
        (y3, db) = _jMul(y3, db, lx, lz);
        (y3, db) = _jSub(y3, db, y1, z1);

        if (da != db) {
            x3 = mulmod(x3, db, n);
            y3 = mulmod(y3, da, n);
            z3 = mulmod(da, db, n);
        } else {
            z3 = da;
        }
    }

    function _ecDouble(uint256 x1, uint256 y1, uint256 z1) public pure
        returns(uint256 x3, uint256 y3, uint256 z3)
    {
        (x3, y3, z3) = _ecAdd(x1, y1, z1, x1, y1, z1);
    }

    function _ecMul(uint256 d, uint256 x1, uint256 y1, uint256 z1) public pure
        returns(uint256 x3, uint256 y3, uint256 z3)
    {
        uint256 remaining = d;
        uint256 px = x1;
        uint256 py = y1;
        uint256 pz = z1;
        uint256 acx = 0;
        uint256 acy = 0;
        uint256 acz = 1;

        if (d == 0) {
            return (0, 0, 1);
        }

        while (remaining != 0) {
            if ((remaining & 1) != 0) {
                (acx,acy,acz) = _ecAdd(acx, acy, acz, px, py, pz);
            }
            remaining = remaining / 2;
            (px, py, pz) = _ecDouble(px, py, pz);
        }

        (x3, y3, z3) = (acx, acy, acz);
    }

    function ecadd(
        uint256 x1, uint256 y1,
        uint256 x2, uint256 y2)
        public
        pure
        returns(uint256 x3, uint256 y3)
    {
        uint256 z;
        (x3, y3, z) = _ecAdd(x1, y1, 1, x2, y2, 1);
        z = _inverse(z);
        x3 = mulmod(x3, z, n);
        y3 = mulmod(y3, z, n);
    }

    function ecmul(uint256 x1, uint256 y1, uint256 scalar) public pure
        returns(uint256 x2, uint256 y2)
    {
        uint256 z;
        (x2, y2, z) = _ecMul(scalar, x1, y1, 1);
        z = _inverse(z);
        x2 = mulmod(x2, z, n);
        y2 = mulmod(y2, z, n);
    }


    function point_hash( uint256[2] memory point )
        public pure returns(address)
    {
        return address(uint256(keccak256(abi.encodePacked(point[0], point[1]))) & 0x00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF);
    }

    /**
    * hash(g^a + B^c)
    */
    function sbmul_add_mul(uint256 s, uint256[2] memory B, uint256 c)
        public pure returns(address)
    {
        uint256 Q = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;
        s = (Q - s) % Q;
        s = mulmod(s, B[0], Q);

        return ecrecover(bytes32(s), B[1] % 2 != 0 ? 28 : 27, bytes32(B[0]), bytes32(mulmod(c, B[0], Q)));
    }

    //
    // Based on the original idea of Vitalik Buterin:
    // https://ethresear.ch/t/you-can-kinda-abuse-ecrecover-to-do-ecmul-in-secp256k1-today/2384/9
    //
    function ecmulVerify(uint256 x1, uint256 y1, uint256 scalar, uint256 qx, uint256 qy) public pure
        returns(bool)
    {
        address signer = sbmul_add_mul(0, [x1, y1], scalar);
        return point_hash([qx, qy]) == signer;
    }

    function publicKey(uint256 privKey) public pure
        returns(uint256 qx, uint256 qy)
    {
        return ecmul(gx, gy, privKey);
    }

    function publicKeyVerify(uint256 privKey, uint256 x, uint256 y) public pure
        returns(bool)
    {
        return ecmulVerify(gx, gy, privKey, x, y);
    }

    function deriveKey(uint256 privKey, uint256 pubX, uint256 pubY) public pure
        returns(uint256 qx, uint256 qy)
    {
        uint256 z;
        (qx, qy, z) = _ecMul(privKey, pubX, pubY, 1);
        z = _inverse(z);
        qx = mulmod(qx, z, n);
        qy = mulmod(qy, z, n);
    }

    
    // (a * b)  mod order
    function ECCMulMod(uint256 _a, uint256 _b) public pure returns (uint256) {
        return mulmod(_a, _b, GEN_ORDER);
    }

    // (a + b)  mod order
    function ECCAddMod(uint256 _a, uint256 _b) public pure returns (uint256) {
        return addmod(_a, _b, GEN_ORDER);
    }

    // (a - b)  mod order
    function ECCSubMod(uint256 _a, uint256 _b) public pure returns (uint256) {
        return submod(_a, _b);
    }

    // 椭圆曲线上的乘法
    function ECCPub(uint256 prikey)
        public
        pure
        returns (uint256[2] memory)
    {
        prikey = addmod(prikey, 0, GEN_ORDER);
        G1Point memory PK = g1mul2(P1(), prikey);
        return [PK.X, PK.Y];
    }

    // 椭圆曲线上的乘法
    function ECCMul(uint256[2] memory PP, uint256 _n)
        public
        pure
        returns (uint256[2] memory R)
    {
        _n = addmod(n, 0, GEN_ORDER);
        G1Point memory Point_R = g1mul2(G1Point(PP[0], PP[1]), _n);
        R = [Point_R.X, Point_R.Y];
    }

    // 椭圆曲线上的加法
    function ECCAdd(uint256[2] memory PP1, uint256[2] memory PP2)
        public
        pure
        returns (uint256[2] memory R)
    {
        G1Point memory Point_R = g1add(G1Point(PP1[0], PP1[1]), G1Point(PP2[0], PP2[1]));
        R = [Point_R.X, Point_R.Y];
    }
}