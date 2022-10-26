// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

//  Digtal Account Manage Contract：数字身份管理合约，提供对数字身份 DA 的以下操作接口
//  - 创建
//  - 查询
//
//  @Reference: https://docs.openzeppelin.com/contracts/4.x/api/token/erc721

contract DAMC is ERC721URIStorage {

    constructor() ERC721("Digtal Account", "DA") {}

    /**
     * @dev Create 创建 DA
     * @notice 调用者即为该 NFT 的 owner
     * @param DAID  - 数字身份的 ID
     * @return uri  - DA 身份信息
     */
    function Create(
        uint256 DAID,
        string memory uri
    ) public payable returns (uint256) {
        _safeMint(msg.sender, DAID); 
        _setTokenURI(DAID, uri);
        return DAID;
    }

    function safeMint(
        uint256 DAID
    ) public payable {
        _safeMint(msg.sender, DAID); 
    }
    
    function setTokenURI(
        uint256 DAID,
        string memory uri
    ) public payable {
        _setTokenURI(DAID, uri);
    }


    function empty() public view {}
    
    function isSameOne(uint256[2] memory PK, address sender)
        internal
        pure
        returns (bool)
    {
        return
            address(
                bytes20(
                    uint160(uint256(keccak256(abi.encodePacked(PK[0], PK[1]))))
                )
            ) == sender;
    }
}
