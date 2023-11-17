pragma solidity ^0.8.5 ;

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/utils/Address.sol";

// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "../dapp/user-register/UserRegister.sol";

import "./nft-types/Asset.sol";

contract NFT_Register is Ownable{

    // User register filter metadata register participants
    UserRegister userRegister;

    // ID of the current network
    uint public networkId;

    // Minimum value for a cid validation/ host request.
    uint public minimumRequestValue;

    mapping(address => nftInfo) public contractInfo;

    mapping(string => address) public cidToContract;

    // Mapping to determine all contracts verified at one time to a distributor. 
    // WARNING! array may contain contracts containing subCIDs not distributed by distributor. 
    // contractInfo will determine if the distributor is the rightful distributor of the NFT!
    mapping(address => address[]) public distributorContracts;

    // Array to hold all nfts contracts verified at one time.
    // WARNING! array may contain contracts no longer verified.
    address[] nftContracts;
    
    // Struct to contain necesarry info on validated contracts.
    struct nftInfo{
        uint8    _type;                 // 0: single,  1: collection, 2: dynamic.
        address  _distributor;          // distributor of the NFT.
        string   _baseCID;              // baseCID for single and collection assets.
        string[] _subCIDs;              // array of subCIDS owned by the contract.
        mapping(string => uint) _block; // block numbers of cid requests.
    }

    struct nftBlock{
        bytes32 _prev;          // previous nft block hash
        bytes32 _root;          // merkle root of transactions
        string _cid;            // cid of nftBlock containing transactions
        uint _block;            // base network block when submitted
    }

    struct transaction{
        address _contract;      // contract owner of the cid.
        address _distributor;   // distributor of NFT
        string[] _cids;         // cids transaction is validating
        uint8 _type;            // contract type.
    }

    nftBlock[] public nftBlocks;

    mapping(bytes32 => nftBlock) public blockMap;

    // Event emitted when a new nft block is submitted.
    event blockSubmitted(nftBlock _block);

    // Event emitted when a verification request is submitted.
    event verificationRequest(address _contract, address _distributor, uint8 _type, string _cid, uint _block);

    // Event emitted when an nft cid has been verifed!
    event verified(address _contract, string _cid);

    // Mapping to hold transactions that have been verified.
    mapping(bytes32 => bool) transactionVerified;

    // Mapping to hold contracts that have been slashed.
    mapping(address => bool) public nftSlashed;
    
    constructor(uint _minimumRequestValue, address _userRegister){
        minimumRequestValue = _minimumRequestValue;
        userRegister = UserRegister(_userRegister);
        nftBlock memory n = nftBlock(bytes32(0), bytes32(0) , "", block.number);
        nftBlocks.push(n);
    }

    function requestVerification(string calldata _cid) public payable {
        require(msg.value >= minimumRequestValue, "Invalid request value.");

        require(Address.isContract(msg.sender), "Sender must be a contract");

        Asset asset = Asset(msg.sender);

    }

    function verifyNFT(bytes32[] calldata _proof, bytes32 _root, bytes32 _transactionHash, transaction memory _transaction) public {

    }

    function submitBlock(nftBlock memory _block) public onlyOwner{
        require(_block._block == 0, "Block must be 0 for initialization.");
        _block._block = block.number;
        nftBlocks.push(_block);
        blockMap[_block._root] = nftBlocks[nftBlocks.length-1];
        emit blockSubmitted(_block);
    }
}