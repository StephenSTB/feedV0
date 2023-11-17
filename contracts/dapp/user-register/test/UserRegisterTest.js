import { Web3Engine, Helper } from "../../../../web3-engine/index.js";

const zeroAddress = "0x0000000000000000000000000000000000000000";

let web3Engine;

let wallet;

let utils;

let BN;

let registerFee;
let userRegister;

// helper

let helper;

const test = async () =>{

    // Initialize Test Environment.
    await initialize()

    // Run user registration testing. 
    await register("RandomSB", 4)
    
    // Run update register testing.
    await update()

    // Run release testing
    await release()

    // Re register for following tests
    await register("RandomSB", 4)

    await register("STB333", 5);

    // Run blackList testing
    await setBlackList()

    // Run whiteList testing
    await setWhiteList();

    // Run grayList testing;
    await setGrayList();

    process.exit(0);
}

const initialize = async () =>{

    web3Engine = await Web3Engine.initialize({ browser:false, networks: ["Ganache"]});

    utils = web3Engine.utils;

    BN = utils.BN;

    wallet = web3Engine.web3Instances["Ganache"].wallet;

    registerFee = new BN(utils.toWei("0.01"))

    let result = await web3Engine.deploy("Ganache", "UserRegister", [registerFee], {from: wallet[4].address})
    
    userRegister = result.success ? result.deployed : undefined;

    console.log(userRegister.address)

    helper = await Helper.initialize(web3Engine.web3Instances["Ganache"]);

}

const register = async (name, account) =>{

    //console.log('\x1b[32m%s\x1b[0m', "Register user test cases.")

    console.log('\x1b[32m%s\x1b[0m', '   Normal Registration');

    await helper.RegisterAndConfirm(name, "bafkreihmp53tf2ozafycllat6kfwehlrr5c4bjwsyfmmfu7t3x7rot63va", "bagaaierakugq7vslhncetigjc7er2pbsoye4e6iogcenk3p66fzzg47xxvfq", account)

    let user = await userRegister.userRegister(wallet[account].address);

    console.log(user)

}

const update = async () =>{
    console.log('\x1b[32m%s\x1b[0m', '   Update Register');

    await userRegister.update( "bafkreihmp53tf2ozafycllat6kfwehlrr5c4bjwsyfmmfu7t3x7rot63va", "bagaaierakugq7vslhncetigjc7er2pbsoye4e6iogcenk3p66fzzg47xxvfq", {from: wallet[4].address});

    let user = await userRegister.userRegister(wallet[4].address);

    console.log(user)
}

const release = async () =>{
    console.log('\x1b[32m%s\x1b[0m', `   Release User`);

    await userRegister.release({from: wallet[4].address})

    let user = await userRegister.userRegister(wallet[4].address);

    console.log(user)
}

const _resetLists = async () => {

    await userRegister.setBlackList(wallet[5].address, false, {from: wallet[4].address});

    await userRegister.setWhiteList(wallet[5].address, false, {from: wallet[4].address});

}

const setBlackList = async () =>{

    console.log('\x1b[32m%s\x1b[0m', `   Black List User`);

    await userRegister.setBlackList(wallet[5].address, true, {from: wallet[4].address});

    let blackListed = await userRegister.blackList(wallet[4].address, wallet[5].address);

    console.log('\x1b[31m%s\x1b[0m', `   ${wallet[5].address} blacklisted: ${blackListed}`)

    try{
        await userRegister.validInteraction(wallet[4].address, wallet[5].address, {from: wallet[5].address, value: utils.toWei(".1")})
    }catch (e){
        console.log("Invalid interaction", e.data)
    }

    await _resetLists()
}

const setWhiteList = async () =>{

    console.log('\x1b[32m%s\x1b[0m', `   White List User`);

    await userRegister.setWhiteList(wallet[5].address, true, {from: wallet[4].address})

    let whiteListed = await userRegister.whiteList(wallet[4].address, wallet[5].address);

    console.log( `   ${wallet[5].address} whitelisted: ${whiteListed}`)

    try{
        let valid = await userRegister.validInteraction.call(wallet[4].address, wallet[5].address)

        console.log(` valid interaction: ${valid}`)
    }catch (e){
        console.log("Invalid interaction", e.data)
    }
    await _resetLists();
}

const setGrayList = async () =>{

    console.log('\x1b[32m%s\x1b[0m', `   Gray List User`);

    await userRegister.setGrayList(utils.toWei(".01"), {from:wallet[4].address});

    let grayListed = await userRegister.grayList(wallet[4].address);

    console.log('\x1b[30m%s\x1b[0m', `   ${wallet[4].address} graylisted: ${utils.fromWei(grayListed.toString())}`)
    
    try{
        await userRegister.validInteraction(wallet[4].address, wallet[5].address, {from: wallet[5].address})
    }
    catch(e){
        console.log("Invalid interaction", e.data)
    }
    try{
        let valid  = await userRegister.validInteraction.call(wallet[4].address, wallet[5].address, {from: wallet[5].address, value: utils.toWei(".01")})
        console.log(` valid interaction: ${valid}`)
    }
    catch(e){
        console.log("Invalid interaction", e.data)
    }
    
}



test();
