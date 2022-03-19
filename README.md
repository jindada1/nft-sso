# DSSO 去中心化单点登录

## 创建身份NFT

```sequence
用户-->SP: 请求创建 DA
Note over SP: 生成 PUID
SP-->用户: PUID，PPK
Note over 用户: 生成 DA 标识串 DAID
用户->DAMC: PUID，PPK，DAID
Note over DAMC: 创建 id 为 DAID 的 NFT \n 将 PUID 和 PPK 写入 NFT 字段 \n  NFT{ id: DAID, owner: UPK, PUID, PPK}
DAMC->用户: 创建成
```


```javascript
function createDANFT(DAID, UPK, puid, ppk) {
    return {
        tokenId: DAID,
        owner: UPK,
        puid,
        ppk,
    }
}
```

## 获取凭证

用户

```javascript
let usk, UPK = user.keyPair()
let M = ExpireTimestamp
let c,e = Schnorr(M, usk)

let h, ekey = IPC.Issue(c, e, M, UPK)
```

IPC

```solidity
// 验证来自客户端的签名
require(verifySchnorr(c, e, M, UPK));
// 请求随机数
uint256 r = 6;
// 计算 rkey = Hash(UPK || r)
uint256 rkey = uint256(keccak256(abi.encodePacked(UPK[0], r)));
// ECDH 计算 rkey 对应的公钥 Rkey = rkey * G
Rkey = eccPub(rkey);
// 计算对称加密的密钥 key = rkey * UPK
uint256 key = (eccMul(UPK, rkey))[0];
// 编码 encode(UPK，key，M) = C 用户凭据信息
// 用 Hash(UPK || key) 加密 C = EC
bytes memory EC = encrypt(
    encode(UPK, key, M),
    uint256(keccak256(abi.encodePacked(UPK[0], key)))
);
// 添加进 logins[hash(EC)] = EC
h = uint256(keccak256(EC));
logins[h] = EC;
```

流程图如下

```sequence
Note over 用户: 构造配置 M = ExpireTimestamp \n Schnorr(M, usk) => c, e
用户->IPC: M, c, e
Note over IPC: 验证 c, e, M, UPK
IPC->预言机: 请求随机数
Note over 预言机: 随机数 r
预言机->IPC: r
Note over IPC: H(UPK || r) -> rkey \n 计算密钥 key = rkey * UPK
Note over IPC: encode(UPK, key, M) => C \n encrypt(C, Hash(UPK || key)) => EC
Note over IPC: h = Hash(EC) \n loginMapping[h] = EC
Note over IPC: 使用 ECDH 交换密钥 key \n rkey*G -> Rkey
IPC->用户: h，Rkey
Note over 用户: 私钥 usk * Rkey -> key \n 计算 k = Hash(UPK || key)
Note over 用户: 保留 key 和凭证 h, k
```



验证凭证

```sequence
Note over 用户: 选择该SP对应的 DAID
Note over 用户: 用密钥 key 对称加密 DAID => EDAID
用户-->SP: h, k, EDAID
SP->IPC: h, k, EDAID, PPK
Note over IPC: 根据索引 h 找到 EC \n 用 k 解密并解码 EC 得到用户元信息 C
Note over IPC: 根据 expire 字段检查是否过期 \n 未过期使用 key 解密 EDAID 得到 DAID
Note over IPC: 根据 DAID 查找 NFT \n 验证 NFT.owner == UPK \n 验证 NFT.PPK == PPK
Note over IPC: 返回 NFT.SUID => SUID
IPC->SP: SUID
Note over SP: 生成 SUID 用户的 token
SP-->用户: token
Note over 用户: 保存该SP的 token
Note over 用户: 调用该SP API 时携带此 token
```

## 实验报告

### 创建 DA

create

```json
{
	"uint256[2] UPK": [
		"12703875022701323419443153798438103425871753726127089737886486253451865066948",
		"6957654411799479655692330363138614503847964531841512732270838918897936459249"
	],
	"uint256 DAID": "45178480055063445125566410952590817868234947602899584886626764152569813979065",
	"uint256 SPPK": "18759004803995162512755791731821489986773779885943364453712055141486810896046",
	"uint256 SPUID": "7232425"
}

transaction cost	400312 gas

{
	"0": "string: uri 2416888816273098469939480911672520281197611914328060812856829257137382133642612703875022701323419443153798438103425871753726127089737886486253451859711597"
}
```

safemint

```json
{
	"uint256 DAID": "45178480055063445125566410952590817868234947602899584886626764152569813979065"
}

transaction cost	69397 gas
```

toString

```json
{
	"uint256[2] UPK": [
		"12703875022701323419443153798438103425871753726127089737886486253451865066948",
		"6957654411799479655692330363138614503847964531841512732270838918897936459249"
	],
	"uint256 SPPK": "18759004803995162512755791731821489986773779885943364453712055141486810896046",
	"uint256 SPUID": "7232425"
}

execution cost	218390 gas

{
	"0": "string: 2416888816273098469939480911672520281197611914328060812856829257137382133642612703875022701323419443153798438103425871753726127089737886486253451859711597"
}
```

setTokenUri 跟字符串长短有关

```
execution cost	161394 gas 
```





```
65459   ECCMul (290ms)

64640   ECCAdd (265ms)

33626 ECCMul (212ms)

29565 ECCAdd (225ms)
```
