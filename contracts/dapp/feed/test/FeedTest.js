import { Web3Engine, Helper } from "../../../../web3-engine/index.js";
import { create } from "ipfs-http-client";
import * as fs from "fs";
import { URL } from 'url';

const zeroAddress = "0x0000000000000000000000000000000000000000";

//const defaultCID = "bafkreihklqozyeoun5x4p6pptq2lxvgd7k7nqvpdn4rfhgbfeksloxp3ye";

const __dirname = new URL('.', import.meta.url).pathname;

const contentFile = fs.readFileSync(__dirname + "user.png")

let ipfs;

let web3Engine;

let web3;

let wallet;

let userRegister;

let feed;

let feedViewer;

let helper;

let utils;

let BN;

const test = async () =>{
    await initialize();

    await setupRegister();

    // Run submit test
    await submit("Check out Ratio Labs.");
    
    // Run retrieve post test
    await retrieve_post()

    // Run submit test
    await submit("SB labs");

    // Run retrieve posts test
    await retrieve_posts();
    
    // Run submit comment test
    await submit_comment();

    await retrieve_comment();
    
    await submit_comment();

    await retrieve_comments();
    
    await withdraw_comment();

    await remove_comment();
    
    await donate_post();

    await retrieve_post_donation();
    
    await donate_post();

    await retrieve_post_donations();
    
    await donate_comment()

    await retrieve_comment_donation();
    
    await donate_comment();

    await retrieve_comment_donations();

    process.exit(1);
}

const initialize = async () =>{

    web3Engine = await Web3Engine.initialize({networks: ["Ganache"], browser: false});

    web3 = web3Engine.web3Instances["Ganache"].web3;

    wallet = web3Engine.web3Instances["Ganache"].wallet;

    let balance = await web3.eth.getBalance(wallet[4].address)

    console.log(`wallet balance ${balance}`)

    userRegister = web3Engine.web3Instances["Ganache"].contracts["UserRegister"];

    console.log(userRegister.address);

    let result = await web3Engine.deploy("Ganache", "Feed", [userRegister.address], {from: wallet[4].address})
    
    feed = result.success ? result.deployed : undefined;

    console.log(feed?.address)

    result = await web3Engine.deploy("Ganache", "FeedViewer", [userRegister.address, feed.address], {from: wallet[4].address})

    feedViewer = result.success ? result.deployed : undefined;

    console.log(feedViewer?.address);

    utils = web3Engine.utils;

    BN = utils.BN;

    ipfs = await create();

    helper = await Helper.initialize(web3Engine.web3Instances["Ganache"])

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

const submit = async(message) =>{

    console.log('\x1b[32m%s\x1b[0m',"   Submit")

    let post = await helper.CreatePost(contentFile, message, 4)

    console.log(post)

    let receipt = await feed.submit(post.block.cid.toString(), {from: wallet[4].address})

    console.log(receipt.logs[0].args)

    //console.log(`post : ${_postId} `)

    let postId =  (await feed.postId()).toString()

    console.log(postId)

}

const retrieve_post = async () =>{
    console.log('\x1b[32m%s\x1b[0m',"   Retrieve Post")
    let post_info = await feedViewer.retrieve_post(0)

    console.log(post_info)
}

const retrieve_posts = async () =>{
    console.log('\x1b[32m%s\x1b[0m',"   Retrieve Posts from Feed")
    let posts = await feedViewer.methods['retrieve_posts(uint256,uint256)'].call(0, 1);

    console.log(posts)

    console.log('\x1b[32m%s\x1b[0m',"   Retrieve Posts from User Feed")

    posts = await feedViewer.methods['retrieve_posts(address,uint256,uint256)'].call(wallet[4].address, 0, 1)

    console.log(posts)
}

const submit_comment = async () =>{

    log('\x1b[32m%s\x1b[0m', "  Submiting Comment")

    let grayListed = await userRegister.grayList(wallet[4].address);

    console.log('\x1b[30m%s\x1b[0m', ` s${wallet[4].address} gray list value: ${grayListed}`)

    let whiteListed = await userRegister.whiteList(wallet[4].address, wallet[5].address)

    let blackListed = await userRegister.blackList(wallet[4].address, wallet[5].address)

    // console.log(`${wallet[5].address} whitelisted: ${whiteListed}`)

    // console.log(`${wallet[5].address} blacklisted: ${blackListed}`)

    let comment = await helper.CreateComment(1, "this is a comment.", 5);

    console.log(comment)

    await feed.submit_comment(1, comment.block.cid.toString(), {from: wallet[5].address, value: utils.toWei(".01")})

}

const retrieve_comment = async () =>{

    log('\x1b[32m%s\x1b[0m',"Retrieve Comment")
    
    let postId = await feed.postId() - 1;
    let post_info = await feedViewer.retrieve_post(postId);

    console.log(post_info)

    let commentId = post_info.totalComments - 1;

    let comment = await feedViewer.retrieve_comment(new BN(postId), new BN(commentId));

    console.log(comment)

}

const retrieve_comments = async() =>{

    log('\x1b[32m%s\x1b[0m',"Retrieve Comments")
    //console.log(feed.methods['retrieve_comments(uint256,uint256,uint256)']);
    
    let comments = await feedViewer.methods['retrieve_comments(uint256,uint256,uint256)'].call(1, 0, 1);

    console.log(` comments: `)
    console.log(comments)
    console.log(` following: ${wallet[4].address} post index 1 comments`)
    comments = await feedViewer.methods['retrieve_comments(address,uint256,uint256,uint256)'].call(wallet[4].address, 1, 0, 1);
    console.log(comments)
    
}

const withdraw_comment = async() =>{

    log('\x1b[32m%s\x1b[0m',"Withdraw Comment")

    await feed.withdraw_comment(1, 1, {from: wallet[5].address})

    let comment = await feedViewer.retrieve_comment(1, 1);
    console.log(comment)

}

const remove_comment =async () =>{

    log('\x1b[32m%s\x1b[0m',"Remove Comment")

    await feed.remove_comment(1, 1, {from: wallet[4].address})

    let comment = await feedViewer.retrieve_comment(1, 1);
    console.log(comment)

}

const donate_post = async () =>{

    log('\x1b[32m%s\x1b[0m',"Donate Post")

    let post_donation = await helper.CreatePostDonation(1, "this is a post donation", 5);

    //console.log(feed.methods)

    await feed.methods['donate(uint256,string)'](1, post_donation.block.cid.toString(), {from: wallet[5].address, value: utils.toWei(".02")});

}

const retrieve_post_donation = async () =>{

    log('\x1b[32m%s\x1b[0m',"Retrieve Post Donation")

    let post_donation = await feedViewer.retrieve_post_donation(1, 0);

    console.log(post_donation)

}

const retrieve_post_donations = async() =>{
    log('\x1b[32m%s\x1b[0m',"Retrieve Post Donations")
    let post_donations = await feedViewer.methods['retrieve_post_donations(uint256,uint256,uint256)'].call(1, 0, 1)
    console.log(post_donations)

    post_donations = await feedViewer.methods['retrieve_post_donations(address,uint256,uint256,uint256)'].call(wallet[4].address, 1, 0, 1)

    console.log(post_donations)
}

const donate_comment = async() =>{
    log('\x1b[32m%s\x1b[0m',"Donate to Comment")
    let comment_donation = await helper.CreateCommentDonation(1, 0, "this is a comment donation", 4);

    //let grayValue = await userRegister.grayList(wallet[5].address);

    //console.log(utils.fromWei(grayValue))

    await feed.methods['donate(uint256,uint256,string)'](1, 0, comment_donation.block.cid.toString(), {from: wallet[4].address, value: utils.toWei(".1")})
    
}

const retrieve_comment_donation = async () =>{
    log('\x1b[32m%s\x1b[0m',"Retrieve Comment Donation")
    let comment_donation = await feedViewer.retrieve_comment_donation(1, 0, 0);

    console.log(comment_donation)
}

const retrieve_comment_donations = async () =>{

    log('\x1b[32m%s\x1b[0m',"Retrieve Comment Donations via PostID")

    //console.log(feed.methods)
    let comment_donations = await feedViewer.methods['retrieve_comment_donations(uint256,uint256,uint256,uint256)'](1, 0, 0, 1)

    console.log(comment_donations)
    log('\x1b[32m%s\x1b[0m',"Retrieve Comment Donations via following")

    comment_donations = await feedViewer.methods['retrieve_comment_donations(address,uint256,uint256,uint256,uint256)'](wallet[4].address, 1, 0, 0, 1)

    console.log(comment_donations)
}

const repost = async () =>{
    log('\x1b[32m%s\x1b[0m',"Repost User Post.")
    let postId = await feed.postId();
    console.log(`repost ${postId}`);
    let repost = await feed.repost(postId-1, {from: wallet[4].address});

}

const log = (style, log) =>{
    console.log(style, log)
}

test();
