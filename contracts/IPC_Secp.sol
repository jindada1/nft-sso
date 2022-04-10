pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "./Secp256k1.sol";

contract IPC {
    
    Secp256k1 public secp = new Secp256k1();

    mapping(uint256 => string) private declarations;
    mapping(uint256 => uint256) private signatures;

    /**
     * @dev Login
     * @notice 调用者链上登录
     * @param s     -
     * @param R     -
     * @param UPK   - 用户公钥
     * @param D     - Schnorr 签名：s, R, UPK
     */
    function Login(
        uint256 s,
        uint256[2] memory R,
        uint256[2] memory UPK,
        string memory D
    ) public payable {
        // 验证来自客户端的签名
        require(verifySchnorr(s, R, UPK, D));
        uint256 key = hash(R, D);
        declarations[key] = D;
        signatures[key] = s;
    }

    function store(
        uint256 key,
        string memory D,
        uint256 s
    ) public payable {
        declarations[key] = D;
        signatures[key] = s;
    }

    function store_declaration(
        uint256 key,
        string memory D
    ) public payable {
        declarations[key] = D;
    }

    /**
     * @dev sigSchnorr
     * @notice 生成 schnorr 签名
     * @param sk    - 用户私钥
     * @param r     - 用户随机数
     * @param D     - 待签名消息 D
     * @return uint256[2] - R
     * @return uint256    - s
     */
    function sigSchnorr(
        uint256 sk,
        uint256 r,
        string memory D
    ) public payable returns (uint256[2] memory R, uint256 s) {
        // R = r*G
        R = eccPub(r);
        // key = Hash(D, R[0])
        uint256 key = hash(R, D);
        // s = r + key*sk
        s = eccAddMod(r, eccMulMod(key, sk));
    }

    /**
     * @dev verifySchnorr
     * @notice 验证 schnorr 签名
     * @param s     -
     * @param R     -
     * @param UPK   - 用户公钥
     * @param D     - Schnorr 签名：s, R, UPK, D
     * @return bool - valid
     */
    function verifySchnorr(
        uint256 s,
        uint256[2] memory R,
        uint256[2] memory UPK,
        string memory D
    ) public payable returns (bool) {
        // s*G ?= R + Hash(D, R[0])*UPK
        uint256[2] memory S = eccPub(s);
        uint256[2] memory right = eccAdd(R, eccMul(UPK, hash(R, D)));

        return S[0] == right[0];
    }

    // 测试用
    function Query(uint256 key)
        public
        view
        returns (string memory D, uint256 s)
    {
        D = declarations[key];
        s = signatures[key];
    }

    // 计算 Hash（PK || a）
    function hash(uint256[2] memory P, string memory s)
        public
        pure
        returns (uint256)
    {
        return uint256(keccak256(abi.encodePacked(P[0], s)));
    }

    // (a + b) mod order
    function eccAddMod(uint256 a, uint256 b) public view returns (uint256) {
        return secp.ECCAddMod(a, b);
    }

    // (a - b) mod order
    function eccSubMod(uint256 a, uint256 b) public view returns (uint256) {
        return secp.ECCSubMod(a, b);
    }

    // (a * b) mod order
    function eccMulMod(uint256 a, uint256 b) internal view returns (uint256) {
        return secp.ECCMulMod(a, b);
    }

    // 推导出某个数（私钥）对应的点（公钥）
    function eccPub(uint256 r) public view returns (uint256[2] memory) {
        return secp.ECCPub(r);
    }

    // 椭圆曲线上一点 × 一个数
    function eccMul(uint256[2] memory P, uint256 r)
        public
        view
        returns (uint256[2] memory)
    {
        return secp.ECCMul(P, r);
    }

    // 椭圆曲线上两点相加
    function eccAdd(uint256[2] memory A, uint256[2] memory B)
        public
        view
        returns (uint256[2] memory AB)
    {
        return secp.ECCAdd(A, B);
    }

    function empty() public view {}
}
