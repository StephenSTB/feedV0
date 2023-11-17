# NFT Protocol Documentation.

## The NFT Dillema.

# NFT Standards

## Ratio Labs NFT types.



### Single Asset NFT Contracts

Contract contains single CID referencing the metadata file of NFT where tokenIDs represent ownership of the digital asset.

tokenURI(uint tokenId){
    return "ipfs://" + CID;
}

### Collection NFT Contracts

Contract contains baseCID referencing the unchanging directory of the collection of assets.
TokenIDs have metadata CID where "ipfs://" + baseCID + "/" + metadataCID directs to the metadata file of the asset on IPFS 
Directory includes metadata json files following popular convention of 1.json 2.json , all asset files of accepted file types referenced in metadata json files,
proof.json contains contract address, distributor address and signature of hash of all metadata files and asset files in order. 


### Dynamic NFT Contracts.

Contract contains no baseCID,
TokenIDs have metadata CID where "ipfs://" + metadataCID directs to data created by distributor. 

## The Protocol

### Metadata Register.

### Oracle


### Block format

#### chain block headers

{
    string _prev: "0x3fa...aa3" // hash of previous block header
    string _root: "0xab3...3da"
    uint _num: "1234"
    string _CID: "Qmabs...adz",
    address _next : "0x123...abc"
}

#### ipfs block
{
    validator: "0x123...abc", // validator submiting this block
    block: 1, // metadata chain block
    transactions: { // transactions
        "0x034...ab3",
        "0x23d...da9",
        ...
    }
    signature: "0x120...34a" // validator signature
}
