import {Web3Engine, Helper} from "../index.js"

import {create} from "ipfs-http-client";

import fs from "fs";

import * as json from 'multiformats/codecs/json'

import { Readable } from "stream";

let ipfs;

let web3Engine;

let helper;

let wallet;

let deployFeed = true;

let default_cid = ""

let default_content = fs.readFileSync("./cid-testing/user.png")

let polyCard = fs.readFileSync("./webpage/src/components/images/Ledgendary/PolyCard_OneHundred_Ledgendary.gif")

const test = async ( ) =>{    

    //console.log(default_content.length)
    await initialize()

    let posts = await helper.RetrievePosts("", 0, 1,)

    console.log(posts)

    //let posts = await helper.RetreivePosts("", 0, 1);
    /*
    console.log(posts);

    console.log(posts.content.posts)

    console.log(posts.content.postJSON)

    console.log(posts.content.content)*/

    process.exit(1);
}

const initialize = async () =>{
    
    
    web3Engine = await Web3Engine.initialize({browser: false, networks:["Ganache"]})
    wallet = web3Engine.web3Instances["Ganache"].wallet
    if(deployFeed){
        let userRegister = web3Engine.web3Instances["Ganache"].contracts["UserRegister"];
        let feed = await web3Engine.deploy("Ganache", "Feed", [userRegister.address], {from: wallet[4].address})
        await web3Engine.deploy("Ganache", "FeedViewer", [userRegister.address, feed.deployed.address], {from: wallet[4].address})
        await initIpfs()
        console.log(await ipfs.version())
        helper = await Helper.initialize(web3Engine.web3Instances["Ganache"], ipfs)
        await createPosts()
        return
    }
    helper = await Helper.initialize(web3Engine.web3Instances["Ganache"], ipfs)
}

const initIpfs = async () =>{
    ipfs = await create({url: '/ip4/127.0.0.1/tcp/5002/http'})

    //let id = await ipfs.id();
    //console.log(id.id)
    //var pins = await ipfs.pin.ls();

    //console.log(`IPFS Pins:`)
/*
    for await (var p of pins){
        console.log(p)
    }*/

    try{
        //var dropedPins = await ipfs.pin.rmAll(pins);
        console.log(`Dropping pins`)

        for await(var p of ipfs.pin.ls()){
            console.log(p)
            await ipfs.pin.rm(p.cid)
            //console.log(p)
        }
    }catch{
        console.log("Removing pins failed.");
    }
    
}

const createPosts = async () =>{        
/*
        let message = "message " + 0
        console.log(message)
        let post = await helper.CreatePost(default_content, message, 4);
        console.log(post)
        let result = await helper.Post(post, 4)
        console.log(result)*/

    const messages = ["message ", "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa strong. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede link mollis pretium. Lorem ipsum vitae."]
    const content = [polyCard, Buffer.from([0])]
    let created = [];

    console.log("content 1", content[1])
    for(let i = 0; i < 2; i++){

        //console.log(message)
        created.push(await helper.Post( content[i], messages[i],  4));
        //console.log(post)
    }
    //created = await Promise.allSettled(created)
    console.log("posted:", created)
    /*
    for(var post of created){
        let posted = await helper.Post(post.value, 4)
        console.log(posted)
    }*/

    var pins = await ipfs.pin.ls();

    //console.log(`IPFS Pins:`)

    for await (var p of pins){
        console.log(p)
    }

}

test();