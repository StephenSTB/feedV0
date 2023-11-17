#!/bin/sh
IP_ADDR=$(hostname -I)
echo $IP_ADDR
ganache --server.host $IP_ADDR --database.dbPath './data/chain'  --server.ws --miner.blockTime 2 --wallet.mnemonic 'base forward fluid lemon doctor cupboard script sell cluster oven else document'
