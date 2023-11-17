import { Web3Engine, Helper } from "../../../../web3-engine/index.js";

import {ecrecover, toBuffer} from "ethereumjs-util";

import { create } from "ipfs-http-client";

import { sha256 } from 'multiformats/hashes/sha2'

import eccrypto from "eccrypto";

import * as json from 'multiformats/codecs/json'

import * as Block from 'multiformats/block'

import assert from "assert";

const zeroAddress = "0x0000000000000000000000000000000000000000";

const defaultCID = "QmcLZTfyPJxvmGQUKqpiMtVa2qTmPS2MvEPm4gyTkm6mrZ";

const default_avatar = "bafyreih67c6lkr4moppqotdetwnfpkb4snm6svaprgc65zxrx3hn263ggu"

const default_bio = "bagaaierakugq7vslhncetigjc7er2pbsoye4e6iogcenk3p66fzzg47xxvfq"

let ipfs;

let web3Engine;

let web3;

let wallet;

// contract instances
let userRegister;

let messages;

// contract helpers

let helper;

let utils;

let BN;

let registerFee;

let enableHash;

let publicKeys = {};

const test = async () =>{
    // Initialize test environment.

    await initialize();

    await setupRegister();

    await enable();

    await send();

    await retrieve();

    await remove();

    await withdraw();

    await setGrayList();

    await retrieveMany();

    process.exit(0)
}

const initialize = async () =>{

    web3Engine = await Web3Engine.initialize({networks: ["Ganache"], browser: false});

    web3 = web3Engine.web3Instances["Ganache"].web3;

    wallet = web3Engine.web3Instances["Ganache"].wallet;

    userRegister = web3Engine.web3Instances["Ganache"].contracts["UserRegister"];

    console.log(userRegister.address);

    let result = await web3Engine.deploy("Ganache", "Messages", [userRegister.address], {from: wallet[4].address})
    
    messages = result.success ? result.deployed : undefined;

    console.log(messages.address)

    utils = web3Engine.web3Instances["Ganache"].web3.utils;

    BN = utils.BN;

    registerFee = new BN(utils.toWei("0.01"))

    enableHash = await messages.enableHash();

    ipfs = await create();

    helper = await Helper.initialize(web3Engine.web3Instances["Ganache"]);

    //ipfs = await IPFS.create()
}

const setupRegister = async () =>{

    if(! (await userRegister.isUser(wallet[4].address))){
        console.log("Register account 4")
        await helper.RegisterAndConfirm("RandomSB", default_avatar, default_bio, 4)
    }

    if(! (await userRegister.isUser(wallet[5].address))){
        console.log("Register account 5")
        await helper.RegisterAndConfirm("STB333", "", default_avatar, default_bio, 5)
    }

}

const _enable = async (account) =>{
    
    let sig = wallet[account].sign("Enable Messages.")
    await messages.enable(sig.signature, {from: wallet[account].address})
    let info = await messages.receiverInfo(wallet[account].address);
    let keybuf = ecrecover(toBuffer(enableHash), info._v, toBuffer(info._r), toBuffer(info._s))
    publicKeys[account] = keybuf.toString('hex')//"0x" + keybuf.toString('hex')
}

//colors 32 == green 31 === red  30 == gray

const enable = async () =>{
    console.log('\x1b[32m%s\x1b[0m', `  Enabling account 4 `)
    await _enable(4)
    console.log("0x"+publicKeys[4].toString('hex'))
    console.log('\x1b[32m%s\x1b[0m', `  Enabling account 5 `)
    await _enable(5)
    console.log("0x"+publicKeys[5].toString('hex'))
}


const send = async () =>{
    console.log('\x1b[32m%s\x1b[0m', `   Send`)
    //let encrypted = await _create("This is a message to you.", 4, 5)

    let message = await helper.CreateMessage("This is a message.", wallet[5].address, 4)

    await messages.send(wallet[5].address, message.cid.toString(), {from: wallet[4].address})

    let cid = await ipfs.block.put(message.bytes, {version: 1, format: "json", mhtype: 'sha2-256'})

    console.log(cid)

}

const retrieve = async () => {
    console.log('\x1b[32m%s\x1b[0m',"   Retrieve")

    let message = await messages.methods['retrieve(uint256)'](0, {from: wallet[5].address});

    console.log(message)

    let encrypted = json.decode(await ipfs.block.get(message._cid))

    console.log(encrypted)

    let encryptedParse = {
        iv: Buffer.from(encrypted.iv.data),
        ephemPublicKey: Buffer.from(encrypted.ephemPublicKey.data),
        ciphertext: Buffer.from(encrypted.ciphertext.data),
        mac: Buffer.from(encrypted.mac.data)
    }

    let ipfs_message = JSON.parse(await eccrypto.decrypt(Buffer.from(wallet[5].privateKey.slice(2), 'hex'), encryptedParse))

    // message authentication verification.

    console.log(ipfs_message.message)

    console.log(ipfs_message.signature)
    
    let address = await web3Engine.web3Instances["Ganache"].web3.eth.accounts.recover(ipfs_message.message, ipfs_message.signature)

   console.log(address)

   assert.equal(message._sender, address, "Error")
}

const remove = async () =>{
    console.log('\x1b[32m%s\x1b[0m',"   Remove")
    await messages.remove(0, {from: wallet[5].address})

    let message = await messages.methods['retrieve(uint256)'](0, {from: wallet[5].address})

    console.log(message)

    await messages.methods['remove(uint256,bool)'](0, true, {from: wallet[5].address}) ;

    message = await messages.methods['retrieve(uint256)'](0, {from: wallet[5].address})

    console.log(message)
}

const withdraw = async () =>{
    console.log('\x1b[32m%s\x1b[0m',"   Withdraw")
    let encrypted = await helper.CreateMessage("another message", wallet[5].address, 4)

    await messages.send(wallet[5].address, encrypted.cid.toString(), {from: wallet[4].address})

    let message = await messages.methods['retrieve(uint256)'](1, {from: wallet[5].address})

    console.log(message)

    await messages.withdraw(wallet[5].address, 1, {from: wallet[4].address})

    message = await messages.methods['retrieve(uint256)'](1, {from: wallet[5].address})

    console.log(message)
}

const setGrayList = async () =>{
    console.log('\x1b[32m%s\x1b[0m',"     Gray List")
    await userRegister.setGrayList(utils.toWei("0.1"), {from: wallet[5].address})

    let value = await userRegister.grayList(wallet[5].address);

    console.log(value)

    let balance = utils.fromWei((await web3.eth.getBalance(wallet[5].address)).toString())

    console.log("5 balance: " + balance)

    let encrypted = await helper.CreateMessage("graylist messsage.", wallet[5].address, 4);

    await messages.send(wallet[5].address, encrypted.cid.toString(), {from: wallet[4].address, value: utils.toWei("0.1")});

    balance = utils.fromWei((await web3.eth.getBalance(wallet[5].address)).toString())

    console.log("5 balance: " + balance)

    try{
        await messages.send(wallet[5].address, encrypted.cid.toString(), {from: wallet[4].address})
    }
    catch(e){
        console.log("Correct Error.", e.data)
    }
}

const retrieveMany = async () =>{

    console.log("Retrieve Many")
    let number = await messages.number({from: wallet[5].address})

    console.log(number.toString())

    //console.log(messages.methods)

    //let _messages = await messages.messages(wallet[5].address, 1);

    //console.log(_messages);

    let _messages = await messages.methods['retrieve(uint256,uint256)'](0,1, {from: wallet[5].address})

    console.log(_messages)

}

test();