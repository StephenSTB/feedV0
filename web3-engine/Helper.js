import Web3 from "web3";

import * as Block from 'multiformats/block';

import * as json from 'multiformats/codecs/json';

import * as raw from 'multiformats/codecs/raw'

import { sha256 } from 'multiformats/hashes/sha2';

import {ecrecover, toBuffer} from "ethereumjs-util";

import eccrypto from "eccrypto";

import { CID } from "multiformats/cid";

import {fileTypeFromBuffer} from "file-type"

let utils = Web3.utils;
//img vid aud
let exts = {
    "jpg": 0,
    "jpeg": 0,
    "png": 0,
    "gif": 0,
    "mp4": 1,
    "webm": 1,
    "mp3": 2,
    "mpga": 2,
    "wav": 2,
    "ogg": 2,
    "oga": 2,
}

export class Helper {
    
    constructor(web3Instance, ipfs){
        this.web3 = web3Instance.web3;
        this.userRegister = web3Instance.contracts["UserRegister"];
        this.messages = web3Instance.contracts["Messages"];
        this.feed = web3Instance.contracts["Feed"];
        this.feedViewer = web3Instance.contracts["FeedViewer"];
        this.wallet = web3Instance.wallet;
        this.ipfs = ipfs;
        this.registerFee = 0;
        this.enableHash = 0;
        this.maxJSON = 800;
        this.maxContent = 1000 * 30000;
    }

    static initialize = async (web3Instance, ipfs) =>{
        let helper = new Helper(web3Instance, ipfs)
        helper.registerFee =  await helper.userRegister.registerFee()
        helper.enableHash = helper.messages !== undefined ? await helper.messages.enableHash() : 0;
        //console.log(`${helper.registerFee} ${helper.enableHash}`)
        return helper;
    }

    DisplayAddress = (address) =>{
        return address.slice(0,5) + "..."+ address.slice(38)
    }

    /* User Register */
    CreateSignature = (name, account) =>{
        let nameHex = utils.utf8ToHex(name);
        let message = nameHex + this.wallet[account].address.slice(2)
        let signature = this.wallet[account].sign(message);
        return signature;
    }

    RegisterAndConfirm = async (name, avatar, bio, account) =>{

        let result = {success: false, error: ""}
        let sig = this.CreateSignature(name, account);
        try{
            await this.userRegister.register(sig.messageHash, sig.signature, {from: this.wallet[account].address, value: this.registerFee});
        }
        catch(e){
            result.error = "Call to register function failed."
            return result;
        }
        try{
            await this.userRegister.confirm(name, avatar, bio, sig.signature, {from: this.wallet[account].address})
        }
        catch(e){
            result.error = "Call to confirm function failed."
            return result;
        }
        result.success = true;
        return result;
    }

    ValidUser = async (account) =>{
        let result = {success: false, user: {}}
        let user = await this.userRegister.userRegister(this.wallet[account].address);
        if(Number(user._block) === 0){
            return result;
        }
        result.success = true;
        result.user = user;
        return result;
    }

    /* Messages */
    CreateMessage = async (message, receiver, account) =>{
        let sig = this.wallet[account].sign(message)
        let signature = sig.signature;
        let msgObj = {
            message,
            signature
        }
        let info = await this.messages.receiverInfo(receiver);
        let keybuf = ecrecover(toBuffer(this.enableHash), info._v, toBuffer(info._r), toBuffer(info._s))
        let encrypted = await eccrypto.encrypt(Buffer.from("04" + keybuf.toString('hex'), "hex"), Buffer.from(JSON.stringify(msgObj)))
        return await Block.encode({ value: encrypted, codec: json, hasher: sha256 })
    }

    /*Feed */
    CreatePost = async (content, message, account) =>{
        let result = {success: false, error:""}
        let contentBlock = "";
        let contentCID = "";
        if(content !== ""){
            try{
                contentBlock = await Block.encode({value: content, codec: raw, hasher: sha256})
            }
            catch{
                result.error = "Content encoding failed."
                return result;
            }
            contentCID = contentBlock.cid.toString();
            //console.log(contentCID)
        }
        let post = {}
        post.content = contentCID;
        post.message = message;
        post.contract = this.feed.address
        let sigMessage = `${post.content}-${post.message}-${post.contract}`
        let sig = this.wallet[account].sign(sigMessage);
        post.signature = sig.signature;
        let block = await Block.encode({ value: post, codec: json, hasher: sha256 })
        return {post, block, content: contentBlock};
    }

    Post = async (content, message, account) => {

        let post = await this.CreatePost(content, message, account)
        console.log("Created post: ",post)
        
        let result = {success: false, error: ""}
        try{
            let receipt = await this.feed.submit(post.block.cid.toString(), {from: this.wallet[account].address});
            console.log(receipt)
        }catch{
            result.error = "Submit post error.";
            return result;
        }
        try{
            //console.log("post json")
            let ipfsPut = await this.ipfs.block.put(post.block.bytes, {version: 1, format: "json", mhtype: 'sha2-256'})
            console.log(ipfsPut)
            await this.ipfs.pin.add(ipfsPut)
            if(post.content !== ""){
                //console.log("post content")
                ipfsPut = await this.ipfs.block.put(post.content.bytes, {version: 1, format: "raw", mhtype: 'sha2-256'})
                await this.ipfs.pin.add(ipfsPut)
            }
        }
        catch{
            result.error = "Distribute content error.";
            return result;
        }
        result.success = true;
        return result;
    }

    RetrievePost = async (postId) =>{
        let result = {success: false, error: ""}
        let post;
        try{
           post = await this.feedViewer.retrieve_post(postId);
        }   
        catch{
            result.error = "Post Retrieval Error.";
            return result;
        }
    
        post = await this.RetrieveContent(post, postId)
        if(!post.success){
            result.error = post.error;
            return result;
        }

        let user = await this.RetrieveUserLight(post.post._user)

        let time = Date.now()

        result.post = {
            name: user.name, 
            avatar: user.avatar, 
            avatarType: user.avatarType,
            address: post.post._user, 
            id: post.id, 
            timelapse: (time - (post.post._timestamp * 1000)) / 1000,
            content: post.content,
            contentType: post.contentType,
            message: post.postJSON.message, 
            totalComments: post.post._totalComments,
            totalDonations: post.post._totalDonations,
            totalDonated: post.post._totalDonated,
            reposts: post.post._reposts
        }
        result.success = true;
            
        return result;
    }

    RetrievePosts = async(following, start, end ) =>{
        let result = {success: false, error: ""}
        let posts;
        // retrieve posts from blockchain
        try{
            if(following === "" || following === undefined){
                posts = await this.feedViewer.retrieve_posts(start, end);
            }
            else{
                posts = await this.feedViewer.retrieve_posts(following, start, end);
            }
        }catch{
            result.error = "Posts Retrieval Error";
            return result;
        }
        console.log("FeedViewer: ", posts)
        // retrieve posts content from ipfs
        try{
            let content = [];
            for(let i = 0; i < posts.length; i++ ){
                console.log(posts[i])
                content.push(this.RetrieveContent(posts[i], start + i))
            }
            //console.log(content)
            posts = await Promise.allSettled(content)
            console.log("RetrieveContent Posts Array: ", posts)
            for(let i = 0; i < posts.length; ){
                if(!posts[i].value.success){
                    posts.slice(i, 1)
                    continue;
                }
                posts[i] = posts[i].value;
                i++;
            }
        }
        catch(e){
            result.error = "Content Retrieval error 2";
            return result;
        }
        // Retrieve user names from blockchain
        let users = []
        try{
            for(let post of posts){
                users.push(this.RetrieveUserLight(post.post._user))
                //console.log(post.post._user)
            }
            users = await Promise.allSettled(users);

            users.forEach((user, index) => users[index] = user.value)
            console.log("RetrieveUsers", users)
        }catch{
            result.error = "User name retrieval error.";
            return result;
        }

        /*
        *   name
        *   avatar
        *   address
        *   id
        *   timelapse
        *   content
        *   contentType
        *   message
        */
        let time = Date.now()
        for(let i = 0; i < posts.length; i++){
            posts[i] = {
                            name: users[i].name, 
                            avatar: users[i].avatar, 
                            avatarType: users[i].avatarType,
                            address: posts[i].post._user, 
                            id: posts[i].id, 
                            timelapse: (time - (posts[i].post._timestamp * 1000)) / 1000,
                            content: posts[i].content,
                            contentType: posts[i].contentType,
                            message: posts[i].postJSON.message,
                            totalComments: posts[i].post._totalComments,
                            totalDonations: posts[i].post._totalDonations,
                            totalDonated: posts[i].post._totalDonated,
                            reposts: posts[i].post._reposts
                        }
        }

        console.log("Final Posts array:", posts)

        result.success = true;
        result.posts = posts;
        return result;
    }

    RetrieveContent = async(post, id) =>{

        let result = {success: false, error: ""}

        let postJSON = "";

        console.log(post._cid)

        try{
            let stat = await this.ipfs.block.stat(post._cid, {signal: AbortSignal.timeout(3000)})
            if(stat.size >= this.maxJSON){
                result.error = "Invalid JSON size.";
                return result;
            }
            postJSON = json.decode(await this.ipfs.block.get(post._cid, {signal: AbortSignal.timeout(3000)}));

            if(postJSON.contract !== this.feed.address){
                result.error = "Invalid Contract address in post JSON.";
                return result;
            }

            let codec = CID.parse(postJSON.content).code;
            if(codec !== 85)
            {
                result.error = "Invalid content codec in post JSON .";
                return result;
            }

            let sigMessage = `${postJSON.content}-${postJSON.message}-${postJSON.contract}`

            let address = this.web3.eth.accounts.recover(sigMessage, postJSON.signature)

            if(address !== post._user){
                result.error = "Invalid signature in post JSON .";
                return result;
            }

        }
        catch{
            result.error = "JSON Retrieval Error.";
            return result;
        }
        
        let content = "";
        let contentType = -1;
        try{
            if(postJSON.content !== "bafkreidogqfzz75tpkmjzjke425xqcrmpcib2p5tg44hnbirumdbpl5adu"){
                let stat = await this.ipfs.block.stat(postJSON.content, {signal: AbortSignal.timeout(3000)})
                console.log(stat)
                if(stat.size >= this.maxContent){
                    result.error = "Invalid content size.";
                    return result;
                }
                content = raw.decode(await this.ipfs.block.get(postJSON.content, {signal: AbortSignal.timeout(10000)}));
                let mime = await fileTypeFromBuffer(content)
                if(exts[mime.ext] === undefined){
                    result.error = "Invalid content type.";
                    return result;
                }
                contentType = mime.mime
            }
        }
        catch{
            result.error = "Content Retrieval Error.";
            return result;
        }

        result.post = post;
        result.id = id;
        result.postJSON = postJSON;
        result.content = content;
        result.contentType = contentType;
        result.success = true;
        return result;
    }


    RetrieveUserLight = async(address) =>{
        let result = {success: false, error: ""}
        let user = await this.userRegister.userRegister(address);
        result.name = user._name;
        console.log(user._name)
        console.log(user._avatar)
        if(user._avatar !== ""){
            try{
                let stat = await this.ipfs.block.stat(user._avatar, {signal: AbortSignal.timeout(3000)})
                console.log(stat)
                if(stat.size >= this.maxContent){
                    result.error = "Invalid Avatar size.";
                    return result;
                }
                result.avatar = raw.decode(await this.ipfs.block.get(user._avatar, {signal: AbortSignal.timeout(3000)}))

                //let avata = await all(this.ipfs.cat(user._avatar, {timeout: 3000}))
                //console.log(avata)
                let mime = await fileTypeFromBuffer(result.avatar)
                if(exts[mime.ext] !== 0){
                    result.error = "Invalid avatar type.";
                    return result;
                }
                result.avatarType = mime.mime
            }
            catch{
                result.error = "User Avatar Retrieval Error."
                return result;
            }
        }
        result.success = true;
        return result
    }

    PostID = async () =>{
        return Number((await this.feed.postId()).toString()) - 1
    }

    ValidatePost(cid, user){

    }

    CreateComment = async (postId, comment, account) =>{
        let commentObj = {};
        commentObj.postId = postId;
        commentObj.comment = comment;
        let sigComment= `${postId}-${comment}`;
        let sig = this.wallet[account].sign(sigComment)
        commentObj.signature = sig.signature;
        let block = await Block.encode({ value: commentObj, codec: json, hasher: sha256 })
        return {commentObj, block};
    }

    CreatePostDonation = async (postId, comment, account) =>{
        let donation = {};
        donation.postId = postId;
        donation.comment = comment;
        let sigMessage = `${postId}-${comment}`;
        let sig = this.wallet[account].sign(sigMessage)
        donation.signature = sig.signature;
        let block = await Block.encode({ value: donation, codec: json, hasher: sha256 })
        return {donation, block}
    }

    CreateCommentDonation = async (postId, commentId, comment, account) =>{
        let donation = {}
        donation.postId = postId;
        donation.commentId = commentId;
        donation.comment = comment;
        let sigMessage = `${postId}-${commentId}-${comment}`;
        let sig = this.wallet[account].sign(sigMessage);
        donation.signature = sig.signature;
        let block = await Block.encode({ value: donation, codec: json, hasher: sha256 });
        return {donation, block}
    }
}