import * as IPFS from 'ipfs-core'

import { create } from "ipfs-http-client";

import * as json from 'multiformats/codecs/json'

import * as pb from '@ipld/dag-pb'

import * as cbor from '@ipld/dag-cbor'

import * as raw from 'multiformats/codecs/raw'

import { sha256 } from 'multiformats/hashes/sha2'

import { CID } from 'multiformats/cid';

import * as Block from 'multiformats/block'

import { base32 } from "multiformats/bases/base32"

import { base16 } from "multiformats/bases/base16"

import { base8 } from "multiformats/bases/base8"

import { base2 } from "multiformats/bases/base2"

import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

import runes from 'runes2'

import testing from "./testing.json" assert {type: "json"};

import bio from "./bio.json" assert {type: "json"}

import Web3 from 'web3';

let utils = Web3.utils;

//import { CID } from "ipfs";

import fs from "fs"


const test = async () =>{
    //let ipfs = create();
    let image = fs.readFileSync("./cid-testing/following.png");

    //console.log(image)
    //pb.encode(image)

    let block = await Block.encode({value: image, codec: raw, hasher: sha256})
    console.log(block) 

    console.log(bio)

    block = await Block.encode({value: bio, codec: json, hasher: sha256});
    console.log(block)

    ///let cid = CID.parse('QmX47cuT2QrxJmaFAfRBEqhH8h7HxwugpE95pfyyegA6ew')
    //console.log(cid);

    //console.log("bafybeiebps6hmfqpf6wuj4gbrh22saiuo2ef4fl3ffhvsjzvdfeqgtpjiq".length)

    //let block = await Block.encode({value: testing, codec: json, hasher: sha256})

    //console.log(block.cid.toString().length)

}
test();

/*

const test = async () =>{

    let ipfs = create();
    let dir = fs.readdirSync("./data/contracts")

    console.log(dir)

    let cids = []

    for(var name of dir){
        let file = fs.readFileSync("./data/contracts/" + name)
        let obj = JSON.parse(file.toString())
        let bytes = json.encode(obj);
        let hash = await sha256.digest(bytes)
        
        console.log(hash.bytes)

        let hash32 = base32.encode(hash.bytes)

        console.log(hash32)

        
        let cid = CID.create(1, json.code, hash)
        //cids.push(cid)

        console.log(cid.toString().length);
        console.log(cid.toString())
    }

    

}
test()*/

/*
const test = async() =>{

    let file = fs.readFileSync("./cid-testing/testing.json");
    
    const ipfs = create();

    let version = await ipfs.version()

    console.log(version)


    let jsonFile = JSON.parse(file.toString())
    const bytes = json.encode(jsonFile)

    //console.log(bytes)

    const hash = await sha256.digest(bytes)

    //console.log(hash)

    const nCid = CID.create(1, json.code, hash)

    console.log(nCid.bytes)

    console.log(nCid.toJSON())

    //console.log(Buffer.from(nCid.toJSON().hash, 'hex').toString('hex'))

    let cid_string = nCid.toString();

    console.log(cid_string)

    //let arr = new Uint8Array(Buffer.from(cid_string))

   console.log(nCid.bytes)

   console.log(Buffer.from(nCid.bytes).toString('hex').length)

   //console.log("cidv1".toString(base32.encoder))

   //let cid_slice = nCid.slice(0, 10)

   //console.log(CID.decode(nCid.bytes))
   //console.log(nCid.toString(base32))
   //console.log(nCid.toString(base32).length)

   //console.log(nCid.toString(base16))

   //let value = nCid.toString();

   //const prefix = runes.substr(value, 0, 1)

   //console.log(prefix)

   /*
   const prefix0 = nCid.toString(base2)

   console.log(prefix0)

   let uArr = new Uint8Array(Buffer.from(prefix0))

   console.log(uArr)

   let res = base8.decode(uArr)8/


   //.decode

   //const prefix1 = Buffer.from(nCid.toString(base8))

   //console.log(prefix1.toString())

    //let prefix2 = base32.encode(Buffer.from(prefix1));

    // prefix00 = nCid.toString(base16)

    //let str = "0x" + prefix00.slice(0,4);

    //console.log(str)

    //let bytes0 = utils.hexToBytes(str)

   // bytes0 = new Uint8Array(Buffer.from(bytes0))

    //let bytes0 = new Uint8Array(Buffer.from(prefix0));

    //console.log(bytes0)

    //let str2 = base32.encode(bytes0)

    //console.log(str2)

    process.exit(0);
}*/

//test();