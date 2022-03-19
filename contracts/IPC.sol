pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "./BN128.sol";

contract IPC {
    mapping(uint256 => bytes) private logins;

    /**
     * @dev Issue
     * @notice 为调用者颁发凭证
     * @param c     -
     * @param e     -
     * @param M     - Schnorr 签名：c，e，M
     * @param UPK   - 用户公钥
     * @return uint256    - h
     * @return uint256[2] - Rkey
     */
    function Issue(
        uint256 c,
        uint256 e,
        uint256 M,
        uint256[2] memory UPK
    ) public payable returns (uint256 h, uint256[2] memory Rkey) {
        // 验证来自客户端的签名
        require(verifySchnorr(c, e, M, UPK));
        // 请求随机数
        uint256 r = 6;
        // 计算 rkey = Hash(UPK || r)
        uint256 rkey = hash(UPK, r);
        // ECDH 算法，计算 rkey 对应的公钥 Rkey = rkey * G
        Rkey = eccPub(rkey);
        // 计算对称加密的密钥 key = rkey * UPK
        uint256 key = (eccMul(UPK, rkey))[0];
        // 编码 encode(UPK，key，M) = C 用户凭据信息
        // 用 Hash(UPK || key) 加密 C = EC
        bytes memory EC = encrypt(
            encode(UPK, key, M),
            hash(UPK, key)
        );
        // 添加进 logins[hash(EC)] = EC
        h = uint256(keccak256(EC));
        logins[h] = EC;
    }

    /**
     * @dev Verify
     * @notice 验证来自客户端的凭证
     * @param h     -
     * @param k     -
     * @param EDAID - Schnorr 签名：c，e，M
     * @param PPK   - 平台公钥
     * @return uint256    - DAID
     */
    function Verify(
        uint256 h,
        uint256 k,
        uint256 EDAID,
        uint256[2] memory PPK
    ) public payable returns (uint256 DAID) {
        // 解密
        bytes memory C = decrypt(logins[h], k);
        uint256 UPK; uint256 key; uint256 M;
        // 解码
        (UPK, key, M) = decode(C);
        DAID = EDAID ^ key;
    }

    /**
     * @dev verifySchnorr
     * @notice 验证 schnorr 签名
     * @param c     -
     * @param e     - e = (r - c*sk) mod order
     * @param M     - Schnorr 签名：c，e，M
     * @param PK    - 用户公钥
     * @return uint - h
     * @return uint - ekey
     */
    function verifySchnorr(
        uint256 c,
        uint256 e,
        uint256 M,
        uint256[2] memory PK
    ) public payable returns (bool valid) {
        // R' = e*G + (c * PK)
        uint256[2] memory R = eccAdd(eccPub(e), eccMul(PK, c));
        // c ?= Hash(M, R'[0])
        return c == uint256(keccak256(abi.encodePacked(M, R[0])));
    }

    function empty() public view {}

    // 测试用
    function ec(uint256 h) public view returns (bytes memory) {
        return logins[h];
    }

    // 计算 Hash（PK || a）
    function hash(uint256[2] memory PK, uint256 a) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(PK[0], a)));
    }

    // (a - b) mod order
    function eccSubMod(uint256 a, uint256 b) public pure returns (uint256) {
        return BN128.ECCSubMod(a, b);
    }

    // (a * b) mod order
    function eccMulMod(uint256 a, uint256 b) internal pure returns (uint256) {
        return BN128.ECCMulMod(a, b);
    }

    // 推导出某个数（私钥）对应的点（公钥）
    function eccPub(uint256 r) public view returns (uint256[2] memory) {
        return BN128.ECCPub(r);
    }

    // 椭圆曲线上一点 × 一个数
    function eccMul(uint256[2] memory P, uint256 r)
        public
        view
        returns (uint256[2] memory)
    {
        return BN128.ECCMul(P, r);
    }

    // 椭圆曲线上两点相加
    function eccAdd(uint256[2] memory A, uint256[2] memory B)
        public
        view
        returns (uint256[2] memory AB)
    {
        return BN128.ECCAdd(A, B);
    }

    // 编码，将传入的 uint256 拼接成一串 bytes，每个 uint256 占 32 bytes
    function encode(
        uint256[2] memory PK,
        uint256 key,
        uint256 M
    ) public pure returns (bytes memory) {
        return abi.encodePacked(PK[0], key, M);
    }

    // 解码，编码的逆操作
    function decode(bytes memory b)
        public
        pure
        returns (
            uint256 PK,
            uint256 key,
            uint256 M
        )
    {
        PK = slice(b, 0);
        key = slice(b, 32);
        M = slice(b, 64);
    }

    // bytes 切片
    function slice(bytes memory a, uint256 offset)
        public
        pure
        returns (uint256)
    {
        bytes32 out;
        for (uint256 i = 0; i < 32; i++) {
            out |= bytes32(a[offset + i] & 0xFF) >> (i * 8);
        }
        return uint256(out);
    }

    // 加密
    function encrypt(bytes memory bs, uint256 key)
        public
        pure
        returns (bytes memory)
    {
        // 异或 xor 加密
        uint256 A = key ^ slice(bs, 0);
        uint256 B = key ^ slice(bs, 32);
        uint256 C = key ^ slice(bs, 64);

        return abi.encodePacked(A, B, C);
    }

    // 解密
    function decrypt(bytes memory bs, uint256 key)
        public
        pure
        returns (bytes memory)
    {
        return encrypt(bs, key);
    }

    /**
     * @dev sigSchnorr
     * @notice 生成 schnorr 签名
     * @param sk    - 用户私钥
     * @param r     - 用户随机数
     * @param M     - 待签名消息 M
     * @return uint - c
     * @return uint - e
     */
    function sigSchnorr(
        uint256 sk,
        uint256 r,
        uint256 M
    ) public payable returns (uint256 c, uint256 e) {
        // R = r*G
        uint256[2] memory R = eccPub(r);
        // c = Hash(M, R[0])
        c = uint256(keccak256(abi.encodePacked(M, R[0])));
        // e = r - c*sk
        e = eccSubMod(r, eccMulMod(c, sk));
    }
}
