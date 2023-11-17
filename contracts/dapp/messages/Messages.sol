// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../user-register/UserRegister.sol";

import "../helper/Helper.sol";

// reentrency gaurd

contract Messages{

    UserRegister immutable userRegister;

    bytes32 public immutable enableHash;

    mapping(address => info) public receiverInfo;

    mapping(address => message[]) messages;

    struct info{
        bytes _signature;
        bytes32 _r;
        bytes32 _s;
        uint8 _v;
        bool _enabled;
    }

    struct message{
        string _cid;
        address _sender;
        uint _value;
        uint _block;
        uint _timestamp;
    }

    modifier isUser(){
        require(userRegister.isUser(msg.sender), "Sender must be registered.");
        _;
    }

    constructor(address _userRegister){
        userRegister = UserRegister(_userRegister);
        enableHash = ECDSA.toEthSignedMessageHash(bytes("Enable Messages."));
    }
    
    function enable(bytes memory _signature) public isUser{
        require(SignatureChecker.isValidSignatureNow(msg.sender, enableHash, _signature), "Invalid Signature");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        // ecrecover takes the signature parameters, and the only way to get them
        // currently is to use assembly.
        /// @solidity memory-safe-assembly
        assembly {
            r := mload(add(_signature, 0x20))
            s := mload(add(_signature, 0x40))
            v := byte(0, mload(add(_signature, 0x60)))
        }
        
        receiverInfo[msg.sender] = info(_signature, r, s, v, true);

    }

    //( string memory _name, , , , ) = userRegister.userRegister(msg.sender);

    function send(address _receiver, string memory _cid) public payable isUser{
        require(userRegister.isUser(_receiver), "The reciever of your message must be registered.");
        require(userRegister.validInteraction{value: msg.value}(_receiver, msg.sender));
        require(Helper.isV1JSONCID(_cid), "CID must be valid JSON.");
        messages[_receiver].push(message(_cid, msg.sender, msg.value, block.number, block.timestamp));
    }

            /*
        messages[msg.sender][_index] = messages[msg.sender][messages[msg.sender].length - 1];
        messages[msg.sender].pop();*/

    function remove(uint _index) public{
        require(_index < messages[msg.sender].length, "The message index is out of range.");
        messages[msg.sender][_index]._cid = "";
    }

    function remove(uint _index, bool _strong) public {
        require(_index < messages[msg.sender].length, "The message index is out of range.");
        messages[msg.sender][_index]._cid = "";
        if(_strong){
            delete messages[msg.sender][_index];   
        }
    }

    function withdraw(address _receiver, uint _index) public payable{
        require(messages[msg.sender].length < _index, "The message index is out of range.");
        require(messages[_receiver][_index]._sender == msg.sender, "you did not send the message");
        messages[_receiver][_index]._cid = "";
    }

    function retrieve(uint _index) public view returns(message memory _message){
        require(_index < messages[msg.sender].length, "_index was out of range.");
        return messages[msg.sender][_index];
    }

    function retrieve(uint _start, uint _end) public view returns(message[] memory _messages){
        require(_end > _start && (_end - _start) < 100, "Invalid start/end value/s.");
        require(_end < messages[msg.sender].length, "Invalid message array length");
        _messages = new message[](_end - _start + 1);
        for(uint i = 0; i <= _end - _start; i++){
            _messages[i] = messages[msg.sender][_start + i];
        }
    }

    function number() public view isUser returns(uint _num){
        return messages[msg.sender].length;
    }
}