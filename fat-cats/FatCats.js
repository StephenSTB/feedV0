

import { Web3Engine } from "../web3-engine/Web3Engine.js";

import { generate_vrf } from "../vrf-js/VRF.js";

import * as elliptic from 'elliptic'

import secp256k1 from 'secp256k1'

const EC = elliptic.default.ec;

const ec = EC('secp256k1')

let FatCats;

const test = async () =>{

    console.log("vrf-test")
    let result = generate_vrf(2, "sample");

    console.log(result)

    let web3Engine = new Web3Engine();
    await web3Engine.initialize(["Ganache"])

    let utils = web3Engine.utils;

    let BN = utils.BN;

    //console.log(web3Engine.contractFactory)

    FatCats = web3Engine.contractFactory.FatCats;

    //console.log(FatCats)
    /*
    {
        "hash": "0x3a36fc2ff539e516897c53d61951209dcac171500ed79692434a28e0cb9c3272",
        "message": "0x73616d706c65",
        "pi": "0x02e111fc96dd022c02f45df180c3707d5a48a5eb669aad2f7b45345b5f95a38f68529c0103cc0e519bb6d690cee60389b28df7e1ff4772d45108b455e9b880726d5aae946ddc35709847a95f3a02d6d0d6",
        "priv": "28948022309329048855892746252171976963209391069768726095651290785379540373584",
        "pub": "0x03a6b594b38fb3e77c6edf78161fade2041f4e09fd8497db776e546c41567feb3c"
      },
      */

    for(let web3 of web3Engine.web3Instances){

        //console.log(process.cwd())

        //console.log(web3)

        let wallet = web3.eth.accounts.wallet;

        let private_key = wallet["4"].privateKey.replace("0x", "")//"28948022309329048855892746252171976963209391069768726095651290785379540373584";//

        console.log(wallet["4"].address)
        console.log(private_key)

        //1e7bcc70c72770dbb72fea022e8a6d07f814d2ebe4de9ae3f7af75bf706902a7b73ff919898c836396a6b0c96812c3213b99372050853bd1678da0ead14487d7
        //642b472649c632df7a7ee1bb5d9c3a3e02962d89e86b203328967ca07174e76070b42375721eb36525f0e2c32dc55144b17f615743cfcac9c6335a2f31b77fd3

        var key  = ec.keyFromPrivate(private_key);

        console.log(web3Engine.publicKeys[4])

        var pubPoint = key.getPublic()
        var x = pubPoint.getX();
        var y = pubPoint.getY();
        console.log(x.toString('hex'))
        console.log(y.toString('hex'))

        var fullPublicKey = x.toString('hex') + y.toString('hex');

        //console.log(fullPublicKey)

        var pubKeyHex = "0x" + fullPublicKey //pubPoint.encode('hex')"";

        console.log(pubKeyHex)

        var hash = web3.utils.sha3(pubKeyHex);

        console.log("0x" + hash.slice(-40))
        /*
        let message = "sample"
        
        let messageHex = "0x" + Buffer.from(message, "utf-8").toString('hex')

        console.log(`message hex: ${messageHex}`)
        
        
        let result = generate_vrf(private_key, message);

        console.log(`proof: ${result.proof}`)
        console.log(`hash: ${result.hash}`);

        console.log(`publicKey: ${result.publicKey}`)
        
        
        FatCats.setProvider(web3.eth.currentProvider);

        FatCats.setWallet(wallet);


        let fatCats = await FatCats.new(utils.toWei("1", "ether"), new BN("1000"), {from: wallet[4].address})
        //console.log(fatCats.address)

        let pubK = await fatCats.decodePoint.call(result.publicKey);

        console.log(pubK[0].toString('hex'));
        console.log(pubK[1].toString('hex'));
        let decodeProof = await fatCats.decodeProof.call(result.proof);

        //console.log(decodeProof);

        let verify = await fatCats.verify.call(pubK, decodeProof, utils.hexToBytes(messageHex))
        console.log(verify)*/
    }

    process.exit(0);
}

test();

