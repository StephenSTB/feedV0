import providers  from "../data/Providers.json" assert {type: "json"};

import networkData from "../data/Network_Data.json" assert {type: "json"};

import fs from "fs";

import os from 'os';

var networkInterfaces = os.networkInterfaces();

const init = () =>{
    console.log("initializing ip data");
    var ip = networkInterfaces.eth0[0].address;

    console.log(`wsl ip address: ${ip}`)

    providers.Ganache.url = "ws://" + ip + ":8545";

    console.log(`Ganache url: ${providers.Ganache.url}`)

    fs.writeFileSync("./data/Providers.json", JSON.stringify(providers, null, 4), (err) =>{
        if(err) 
            console.log(err)
    })

    fs.writeFileSync("./web3-engine/data/Providers.json", JSON.stringify(providers, null, 4), (err) =>{
        if(err) 
            console.log(err)
    })
    
    fs.writeFileSync("./webpage/node_modules/@feed/web3-engine/data/Providers.json", JSON.stringify(providers, null, 4), (err) =>{
        if(err) 
            console.log(err)
    })

    networkData[1337].rpcUrls[0] = "http://" + ip + ":8545";

    console.log(`Ganache network data url: ${networkData[1337].rpcUrls[0]}`);

    fs.writeFileSync("./data/Network_Data.json", JSON.stringify(networkData, null, 4))

    fs.writeFileSync("./web3-engine/data/Network_Data.json", JSON.stringify(networkData, null, 4))

    //fs.writeFileSync("./webpage/node_modules/@ratio-labs/web3-engine/data/Network_Data.json", JSON.stringify(networkData, null, 4))
}

init();