pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/utils/Counters.sol";

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

import "vrf-solidity/contracts/VRF.sol";

import "../nft-protocol/nft-types/Asset.sol";

contract FatCats is ERC721, Asset{

    using Counters for Counters.Counter;
    using Strings for uint256;

    address public metadataRegister;

    bytes32 root;

    uint immutable mintFee;

    uint immutable maxMint;

    string public baseCID;

    //bool public enableSubCID = false;

    constructor(uint _mintFee, uint _maxMint)ERC721("FatCats", "FC")Asset(1){
        mintFee = _mintFee;
        maxMint = _maxMint;
    }

    function setBaseCID(string memory _baseCID, bytes32 _root) public onlyDistributor{
        baseCID = _baseCID;
        root = _root;
    }

    function requestBaseCIDVerification(address payable _metadataRegister, uint _gas) public payable onlyDistributor{
        metadataRegister = _metadataRegister;
        _metadataRegister.call{value: msg.value}(abi.encodeWithSignature("requestVerification(string calldata _cid)", baseCID));
    }

    /*
    function enableSubCIDVerification() public onlyDistributor{
        enableSubCID = true;
    }

    function requestSubCIDVerification(uint tokenId, uint _cid) public payable{
        require(enableSubCID, "Sub CID verification has not yet been enabled.");
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of given tokenId");
        require();
        metadataRegister.call{value: msg.value}(abi.encodeWithSignature("requestVerification(string calldata _cid)", baseCID));
    }*/

    function verify(uint256[2] memory _publicKey, uint256[4] memory _proof, bytes memory _message) public pure returns (bool) {
        return VRF.verify(_publicKey, _proof, _message);
    }

    function decodeProof(bytes memory _proof) external pure returns(uint[4] memory _decodedProof){
        return VRF.decodeProof(_proof);
    }

    function decodePoint(bytes memory _point) public pure returns (uint[2] memory) {
        return VRF.decodePoint(_point);
    }

    function mint() public payable{

    }

    function _baseURI() internal override view returns(string memory){
        return string(abi.encodePacked("ipfs://", baseCID, "/"));
    }

    function tokenURI(uint tokenId) public override view returns(string memory){
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(_baseURI(), tokenId.toString()));
    }


}