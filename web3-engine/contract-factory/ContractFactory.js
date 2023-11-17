import contract from "@truffle/contract";

import FatCats from '../data/contracts/FatCats.json' assert {type: "json"};

import NFT_Register from "../data/contracts/NFT_Register.json" assert {type: "json"};

// Dapp
import UserRegister from "../data/contracts/UserRegister.json" assert {type: "json"};

import Messages from "../data/contracts/Messages.json" assert {type: "json"};

import Feed from "../data/contracts/Feed.json" assert {type: "json"};

import FeedViewer from "../data/contracts/FeedViewer.json" assert {type: "json"};

let fatCats = contract(FatCats)

let nftRegister = contract(NFT_Register);

// Dapp
let userRegister = contract(UserRegister);

let messages = contract(Messages);

let feed = contract(Feed)

let feedViewer = contract(FeedViewer)
 
export default {
    ContractFactory : {
        "NFT_Register": nftRegister,
        "FatCats" : fatCats,
        "UserRegister" : userRegister,
        "Messages" : messages,
        "Feed" : feed,
        "FeedViewer": feedViewer
    }
}



