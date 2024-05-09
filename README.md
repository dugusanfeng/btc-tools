### 依赖

Runes协议本身需要依赖于Ordinal协议。对ordinal协议支持的工具主要是ord([源码地址](https://github.com/ordinals/ord))
通过ord可以部署一个service，这个service可以连接指定节点处理sat的排序和展示，索引runes资产并展示。同时其提供命令行可以支持
Ordinal inscription和runes资产的创建和mint交易。对runes的支持是非常友好的，但目前该工具不支持对BRC-20协议的支持。因此我们需要
连接我们自己搭建的节点同时在云主机下部署ord服务。

安装部署:

+ 安装ord

```shell
curl --proto '=https' --tlsv1.2 -fsLS https://ordinals.com/install.sh | bash -s

ord --version // 查看是否安装成功
```

+ 配置ord服务配置

```yaml
bitcoin_rpc_password: 123456 # 节点rpc密码
bitcoin_rpc_url: http://10.10.8.184:18443 # 节点rpc端口
bitcoin_rpc_username: platon # 节点rpc
chain: mainnet # 节点网络(mainnet/testnet/regtest)
commit_interval: 10000
cookie_file: /Users/steven/bin/.cookie # .cookie文件路径
data_dir: /Users/steven/Library/Application Support/ord/regtest/ # 文件路径
index: /Users/steven/Library/Application Support/ord/regtest/index.redb # 索引文件路径
index_cache_size: 1000000000
index_runes: true
index_sats: true
index_spent_sats: true
index_transactions: true
no_index_inscriptions: false
server_url: http://127.0.0.1:80 # ord web服务url
```

.cookie文件的内容是rpc节点的user和password, 例如platon:123456。vim编辑后执行命令去除最后一个字符。

```shell
truncate -s -1 .cookie
```

上面是我本地ord服务的配置，有注释的地方需要看情况修改

+ 启动ord服务

```shell
ord --config config.yml server
```

ord服务会连接rpc节点进行索引，主网可能需要1-2天同步索引完成。可访问${server_url}

### Usage
+ 钱包导入

配置助记词keystore文件，执行命令:
```shell
yarn importWallet --walletName ${walletName} --path ${keystore目录,默认为项目config/keystore/mnemonic.json}

输入keystore密码以完成导入
```

+ UTXO找零或者合并(taproot地址)

```shell
yarn utxo --index 1 --outputs ${unspent列表} --vouts ${分拆或者合并的utxo金额列表}

example:
yarn utxo --index 1 --outputs '["24d25b1105900d914d52cfadb97ff8c57cae86430bf23fbe0757f05a8727defe:0"]' --vouts '[1499990000, 1000000000]'
```
上述的例子表示将24d25b1105900d914d52cfadb97ff8c57cae86430bf23fbe0757f05a8727defe:0的utxo拆分成两个金额分别为1499990000, 1000000000的两个utxo


+ BTC当前网络手续费信息

```javascript
yarn getFeeRate
```

+ **查询符文/铭文资产信息，Name，最小Mint单位等**


+ Ordinal inscription交易(支持文件和json格式的metadata)

```javascript
yarn inscription --walletName ${walletName} --filePath ${铭文对应的文件路径} --feeRate ${交易费率, 默认为halfHour类型} --receiver ${接收者地址}
```

+ Runes mint交易

```javascript
yarn mintRunes --walletName ${walletName} --runeName ${runes name} --feeRate ${交易费率, 默认为最快类型} --number ${mint个数，默认为1} --receiver ${接收者地址}
```

+ 钱包资产查询(btc余额，Ordinal及runes资产展示以及unspent列表)

```shell
yarn walletAsset --walletName ${钱包名称}
yarn walletAsset --walletName ${钱包名称} --unspent ${是否获取钱包unspent列表，默认为false}
```

+ inscription和runes资产转移

```javascript
yarn transfer --feeRate ${交易费率, 默认为经济类型} --receiver ${接收者地址} --name ${资产名称}
```
备注: 对于inscription资产来说，这里的name是inscription id。对于runes资产来说，这里的name是**数量:runeName**，例如100:ZTHE•TEST•RUNE

+ BRC-20接口的支持(后续考虑支持)
