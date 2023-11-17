import * as bip39 from 'bip39';

import CryptoJS from "crypto-js";

import { Web3Engine, Helper, Ipfs } from './index.js';

export class Web3User {

    #password = undefined;

    constructor(){
    }

    static createMnemonic = () =>{
        return bip39.generateMnemonic();
    }

    static create = (mnemonic)=>{
        let user = {}
        user.mnemonic = mnemonic;
        user.address = "";
        user.name = "";
        user.messages = { lastMessageIndex: 0 }
        user.following = {};
        user.block = {};
        user.whitelist = {};
        user.blacklist = {};
        user.providers = {}
        user.donation = 0;
        return user; 
    }

    static retreive = () =>{
        return localStorage.getItem("web3user");
    }

    static remove = () => {
        localStorage.removeItem("web3user")
    }

    static validateMnemonic = (mnemonic) => {
        return bip39.validateMnemonic(mnemonic);
    }

    static set = (user, password) =>{
        let result = {success: false, error: ""};

        if(user.encryptedUser !== undefined){
            localStorage.setItem("web3user", JSON.stringify(user));
            result = Web3User.decrypt(password);
            if(!result.success){
                Web3User.remove()
                result.error = "Invalid decrypt when setting encrypted file";
                return result;
            }
            result.success = true;
            return result;
        }

        //console.log(password)
        if(user.mnemonic === undefined ||  user.address === undefined || user.name === undefined || 
            user.messages === undefined || user.following === undefined || user.block === undefined ||
            user.whitelist === undefined || user.blacklist === undefined || user.providers === undefined || user.donation === undefined){
            result.error = "Invalid user object, undefined required field given.";
            return result;
        }
        if(password.length < 12 || password.length > 30){
            result.error = "Invalid password length given." 
            return result;
        }
        if(!  /\d/.test(password)){
            result.error = "Password must contain a number."
        }
        if(!bip39.validateMnemonic(user.mnemonic)){
            result.error = "Invalid mnemonic given."
            return result;
        }

        var encryptedUser = CryptoJS.AES.encrypt(JSON.stringify(user), password).toString();

        var hmac = CryptoJS.HmacSHA256(encryptedUser, CryptoJS.SHA256(password)).toString();

        //console.log(hmac)

        localStorage.setItem("web3user", JSON.stringify({encryptedUser, hmac}))

        result.success = true;
        return result;
    }

    static decrypt = (password) =>{
        let result = {success: false, error: ""}

        try{
            let cookie = JSON.parse(Web3User.retreive());

            console.log(cookie)

            let vhmac = CryptoJS.HmacSHA256(cookie["encryptedUser"], CryptoJS.SHA256(password)).toString();

            console.log(vhmac)

            if(cookie["hmac"] != vhmac){
                result.error = "Incorrect Password or User. Try password again or import User.";
                return result;
            }

            let decryptedUser = CryptoJS.AES.decrypt(cookie["encryptedUser"], password).toString(CryptoJS.enc.Utf8);

            try{
                result.info = JSON.parse(decryptedUser);
            }
            catch(e){
                result.error = "Invalid JSON parse."
                return result;
            }
            
            result.success = true;
            return result;
        }
        catch(e){
            return result;
        }
    }

    static unlock = async (args) =>{
        let web3User = new Web3User()
        let result = Web3User.decrypt(args.password)
        if(!result.success){
            return result;
        }
        web3User.#password = args.password;
        web3User.info = result.info
        result = {success: false, error:""}
        try{
            args.web3Engine.mnemonic = web3User.info.mnemonic;
            web3User.web3Engine = await Web3Engine.initialize(args.web3Engine);
            web3User.ipfs = args.webrtc_star ? await Ipfs(args.webrtc_star, "") : args.ipfs_http ? await Ipfs(undefined, args.ipfs_http) : await Ipfs();
            web3User.helper = await Helper.initialize(web3User.web3Engine.web3Instances[web3User.web3Engine.networks[0]], web3User.ipfs)
        }
        catch(e){
            result.error = "Connection initialization failed."
            return result
        }
        result.web3User = web3User;
        result.success = true;
        return result;
    }

    modify = (keys) =>{
        let result = {success: false, error: ""}
        if(this.info === undefined){
            result.error = "User object has not been instantiated.";
            return result;
        }
        if(this.#password === undefined){
            console.log("password is undefiend")
            result.error = "password is undefiend";
            return result;
        }
        let cookie = JSON.parse(Web3User.retreive());

        console.log(cookie)

        let vhmac = CryptoJS.HmacSHA256(cookie["encryptedUser"], CryptoJS.SHA256(this.#password)).toString();

        console.log(vhmac)

        if(cookie["hmac"] != vhmac){
            result.error = "Incorrect Password or User. Try password again or import User.";
            return result;
        }

        for(var k in keys){
            console.log(k)
            this.info[k] = keys[k];
        }

        result = Web3User.set(this.info, this.#password);

        return result;
    }
}