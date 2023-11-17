
import contractFactory from "./contract-factory/ContractFactory.js";

import providers from "./data/Providers.json" assert {type: "json"};

import deployedContracts from "./data/Deployed_Contracts.json" assert {type: "json"};

import Web3 from "web3";

import * as bip39 from "bip39";

import HDKey from "hdkey";

import fs from "fs";

import { URL } from 'url';

const __dirname = new URL('.', import.meta.url).pathname;

export class Web3Engine{
    constructor(){
       //this.mnemonic = fs.readFileSync("./data/.secret").toString();
       this.web3Instances = {};
       this.utils = Web3.utils;
       this.publicKeys = []
       this.contractFactory = contractFactory.ContractFactory;
    }
    static initialize = async(args) =>{
        let web3Engine = new Web3Engine();

        web3Engine.browser = args.browser;
        //console.log(__dirname)
        web3Engine.mnemonic = web3Engine.browser ? args.mnemonic : fs.readFileSync("./data/.secret").toString();
        web3Engine.providers = web3Engine.browser ? args.providers : providers;
        web3Engine.networks = args.networks;
        await web3Engine.#initProviders()
        await web3Engine.#initWallet();
        await web3Engine.#initContracts();
        return web3Engine;
    }

    #initProviders = async () =>{
        for(let n of this.networks){
            if(!this.providers[n] === undefined || this.providers[n].url === undefined){
                console.log("Error provider was not found for given network")
                continue;
            }
            console.log(this.providers[n].url)
            this.web3Instances[n] = {
                web3: new Web3(this.providers[n].url),
                contracts: {}
            }
            let web3 = this.web3Instances[n].web3;
            try{    
                let id = await web3.eth.getChainId()
                console.log(`${n} listening: ${id}`)
                this.web3Instances[n].id = id;
            }catch{
                //remove
                console.log(`Error connection to ${n} was unsuccessful.`)
                delete this.web3Instances[n]
                this.networks.splice(this.networks.indexOf(this.networks[n], 1))
                return false;
            }
        }
    }
    #initWallet = async () =>{
        let seed = bip39.mnemonicToSeedSync(this.mnemonic);
        let hdkey = HDKey.fromMasterSeed(seed);
        let privateKeys = []
        for(let i = 0; i < 10; i ++){
            let key = hdkey.derive("m/44'/60'/0'/0/" + i.toString());
            privateKeys.push("0x" + key.privateKey.toString('hex'));
            this.publicKeys.push(key.publicKey.toString('hex'));   
        }
        //console.log(privateKeys)
        for(var n of this.networks){
            
            let web3 = this.web3Instances[n].web3;

            for(var privateKey of privateKeys){
                await web3.eth.accounts.wallet.add(privateKey);
            }
            
            this.web3Instances[n].wallet = web3.eth.accounts.wallet;
        }
    }
    #initContracts = async () =>{
        for(var n of this.networks){
            if(deployedContracts[n] === undefined){
                continue;
            }
            for(var contract in this.contractFactory){
                if(deployedContracts[n][contract] !== undefined){
                    var contractInstance = this.contractFactory[contract];
                    contractInstance.setProvider(this.web3Instances[n].web3.eth.currentProvider);
                    contractInstance.setWallet(this.web3Instances[n].wallet);
                    try{
                        this.web3Instances[n].contracts[contract] = await contractInstance.at(deployedContracts[n][contract]);
                    }catch{
                        console.log(`Contract: ${contract} was not found on ${n} at ${deployedContracts[n][contract]}`)
                    }
                    
                }
            }
        }
    }

    #updateContracts = (network, name, address) =>{
        deployedContracts[network][name] = address;
        console.log(deployedContracts)
        if(!this.browser){
            fs?.writeFileSync(__dirname + "/data/Deployed_Contracts.json", JSON.stringify(deployedContracts, null, 4));
        }
        
        //fs.writeFileSync("./webpage/src/modules/data/Deployed_Contracts.json", JSON.stringify(deployedContracts, null, 4));
    }

    addProvider = async (name, url) =>{

    }

    addContract = async (network, name, address) => {

    }


    // deploy contract , params
    deploy = async(network, contract, args, tx_params) =>{
        let result = {success: false, error: ""}
        if(this.web3Instances[network] === undefined){
            result.error = "network not found in web3 engine instance."
            return result;
        }
        if(this.contractFactory[contract] === undefined){
            result.error = "contract was not found in contract factory."
            return result;
        }

        try{
            let web3 = this.web3Instances[network].web3;
            let contractInstance = this.contractFactory[contract];
            let wallet = this.web3Instances[network].wallet;
            
            contractInstance.setProvider(web3.eth.currentProvider);
            contractInstance.setWallet(wallet);

            let gas = await contractInstance.new.estimateGas(...args, tx_params);
            console.log(`gas: ${gas}`)
            
            let deployed = await contractInstance.new(...args, tx_params);
            this.web3Instances[network].contracts[contract] = deployed;

            result.success = true;
            result.deployed = deployed;
            this.#updateContracts(network, contract, deployed.address)
            return result;
        }catch(e){
            console.log(e);
            result.error = "failed to deploy contract.";
            return result;
        }

    }

    sendTransaction(newtork, contract, method, params, account){

    }
}