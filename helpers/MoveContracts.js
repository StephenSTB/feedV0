import fs from "fs";

let dir = fs.readdirSync("./data/contracts");

dir.forEach(file =>{
    fs.copyFileSync("./data/contracts/" + file, "./web3-engine/data/contracts/" + file)
})
/*
dir.forEach(file =>{
    fs.copyFileSync("./data/contracts/" + file, "./webpage/src/contracts/" + file)
})*/



