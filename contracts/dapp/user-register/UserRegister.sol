// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../helper/Helper.sol";

// reentrency gaurd

// Contract To register ethereum addresses to Users.
contract UserRegister is Ownable{

    // Fee for user registration. set by owner.
    uint public registerFee;

    // Mappings to direct address and name information to the appropriate User.
    mapping(address => User) public userRegister;
    mapping(string => address) public nameRegister;

    mapping(address => mapping(address => bool)) public whiteList;
    mapping(address => mapping(address => bool)) public blackList;
    mapping(address => uint) public grayList;
    
    // Information struct for a User.
    struct User{
        string _name;
        string _avatar;
        string _bio;
        uint _block;
    }

    // mapping to hold user name requests.
    mapping(bytes => request) requests;

    // Information struct for user name request.
    struct request{
        bytes32 _hash;
        address _requester;
        uint _block;
    }

    modifier onlyUser{
        require(userRegister[msg.sender]._block != 0 , "Invalid User");
        _;
    }
    
    /*
    * @param _registerFee - The amount of base network token fee.
    */
    constructor (uint _registerFee){
        registerFee = _registerFee;
    }

    // Request user registration.
    function register(bytes32 _hash, bytes memory _signature) public payable {
        require(msg.value >= registerFee, "Invalid fee value given.");
        require(SignatureChecker.isValidSignatureNow(msg.sender, _hash, _signature), "Invalid signature given for sender.");
        requests[_signature] = request(_hash, msg.sender, block.number);
    }

    // Confirm user registration.
    function confirm(
        string memory _name,
        string memory _avatar, 
        string memory _bio,
        bytes memory _signature) 
    public {
        require(bytes(_name).length > 4 && bytes(_name).length <= 30, "Invalid name length.");
        if(!Helper.compareStrings(_avatar, "")){
            require(Helper.isV1RawCID(_avatar), "Invalid _avatar Raw CID.");
        }
        if(!Helper.compareStrings(_bio, "")){
            require(Helper.isV1JSONCID(_bio), "Invalid _bio JSON CID.");
        }
        require(requests[_signature]._block != 0, "This signature has not been registerd.");
        bytes32 _hash = ECDSA.toEthSignedMessageHash(bytes(abi.encodePacked(_name, msg.sender)));
        require(SignatureChecker.isValidSignatureNow(msg.sender, _hash, _signature), "Invalid signature given for sender.");
        if(userRegister[nameRegister[_name]]._block != 0){
            require(userRegister[nameRegister[_name]]._block > requests[_signature]._block, "Name was already taken.");
            delete userRegister[nameRegister[_name]];
        }
        nameRegister[_name] = msg.sender;
        userRegister[msg.sender] = User(_name, _avatar, _bio, requests[_signature]._block);
        delete requests[_signature];
    }

    // Update user info.
    function update(string memory _avatar, string memory _bio) public onlyUser{
        require(Helper.isV1RawCID(_avatar), "Invalid _avatar Raw CID.");
        require(Helper.isV1JSONCID(_bio), "Invalid _bio JSON CID.");
        userRegister[msg.sender]._avatar = _avatar;
        userRegister[msg.sender]._bio = _bio;
    }

    // Release user info.
    function release() public{
        delete nameRegister[userRegister[msg.sender]._name];
        delete userRegister[msg.sender];
    }

    function setGrayList(uint _value) public onlyUser{
        grayList[msg.sender] = _value;
    }

    function setWhiteList(address _white, bool _value) public onlyUser{
        require(isUser(_white), "Address being white listed must be registered.");
        whiteList[msg.sender][_white] = _value;
    }

    function setBlackList(address _black, bool _value) public onlyUser{
        require(isUser(_black), "Address being black listed must be registered.");
        blackList[msg.sender][_black] = _value;
    }

    function validInteraction(address _receiver, address _sender) public payable returns(bool _interact){
        require(!blackList[_receiver][_sender], "The receiver has blacklisted interactions from sender.");
        // Condition to bypass dontation for whitelist
        if(!whiteList[_receiver][_sender]){
            require(msg.value >= grayList[_receiver], "msg value was below graylist value of receiver.");
            (bool sent, )  = _receiver.call{value: msg.value}("");
            require(sent, "Failed to send Ether");
        }
        return true;
    }

    function isUser(address _user) public view returns(bool){
        return userRegister[_user]._block != 0;
    }

    function getInfo(address _user) public view returns(User memory _info){
        return userRegister[_user];
    }

    function setRegisterFee(uint _registerFee) public onlyOwner{
        registerFee = _registerFee;
    }
}