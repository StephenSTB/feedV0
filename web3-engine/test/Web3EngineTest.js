import {Web3Engine, Web3User,  Helper} from "../index.js";

const test = async () =>{
    //let web3Engine = new Web3Engine()

    try{

        let web3Engine = await Web3Engine.initialize({networks: ["Ganache"], browser: false})
        let wallet;

        if(web3Engine.web3Instances["Ganache"] !== undefined){
            wallet = web3Engine.web3Instances["Ganache"].wallet;
        }

        //console.log(web3Engine.web3Instances)

        let utils = web3Engine.utils;

        let BN = utils.BN;

        console.log(wallet)

        /*
        let helper = await Helper.initialize(web3Engine.web3Instances["Ganache"]);

        let result = await helper.RegisterAndConfirm("SB1234", "bafyreih67c6lkr4moppqotdetwnfpkb4snm6svaprgc65zxrx3hn263ggu", "bagaaierakugq7vslhncetigjc7er2pbsoye4e6iogcenk3p66fzzg47xxvfq", 0);

        console.log(result.success)*/

        //let userRegister = await web3Engine.deploy("Ganache", "UserRegister", [ new BN(utils.toWei("0.01"))], {from: wallet[4].address}); //await web3Engine.web3Instances["Ganache"].contracts["UserRegister"]

        //console.log(`userRegister: ${userRegister.deployed.address}`)

        //console.log(Web3User.createMnemonic())

        //let mnemonic = Web3User.createMnemonic()
        //let web3User = new Web3User();
        /*
        let user = {}
        user.mnemonic = mnemonic;
        user.following = {}*/

        //web3User.setUser(user, "password1234")

        //let Feed = await web3Engine.deploy("Ganache", "Feed", [ userRegister.deployed.address ], {from: wallet[4].address}); 

        //.log(userRegisterGanache.deployed.address);

    }catch(e){
        console.error(e);
    }
    process.exit(0);
} 
test();