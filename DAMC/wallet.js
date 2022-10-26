/**
 * 数字身份钱包：使用分层钱包来管理用户的数字身份
 * 
 * 每个数字身份的 ID 都由分层钱包生成
 */

const HDWallet = require('ethereum-hdwallet')

const mnemonic = 'tag volcano eight thank tide danger coast health above argue embrace heavy'
const hdwallet = HDWallet.fromMnemonic(mnemonic)

console.log(hdwallet.derive(`m/44'/60'/0'/0/0`).getPublicKey().toString('hex'))
console.log(hdwallet.derive(`m/44'/60'/0'/0/0`).getPublicKey(true).toString('hex'))
// 026005c86a6718f66221713a77073c41291cc3abbfcd03aa4955e9b2b50dbf7f9b

console.log(hdwallet.derive(`m/44'/60'/0'/0/0`).getPrivateKey().toString('hex'))
// 63e21d10fd50155dbba0e7d3f7431a400b84b4c2ac1ee38872f82448fe3ecfb9

console.log(`0x${hdwallet.derive(`m/44'/60'/0'/0/0`).getAddress().toString('hex')}`)
// 0xc49926c4124cee1cba0ea94ea31a6c12318df947