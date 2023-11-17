// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import "../dapp/user-register/UserRegister.sol";

// An oracle to submit blocks to reliant contracts via pos validator set.
contract Oracle{

    uint public epoch; // current epoch dictating the validator set.
    uint[2] public slot; // current slot of blocks containing range of expected block submsion.
    uint public slotLen;
    uint public slotNum;
    uint[2] public transition;
    uint public transitionLen; // epoch transition block width, used to setup next validator set.
    
    address currentValidator; // current validator expected to submit a block;

    // validator struct to determine valid stake range to submit block.
    struct validator{
        uint _min;
        uint _max;
        uint _stake;
        address _validator;
    }

    uint totalStake; // total amount of base chain collateral staked.

    validator[3] public currentValidators; // array containing current validator set for epoch.

    validator[3] public nextValidators; // array containing validators for next epoch.

    mapping(address => validator) public validatorMap;

    address[] public contractArr; 

    mapping(address => bool) public contractMap;

    UserRegister public userRegister;

    struct oracleBlock{
        bytes32 _prev;
        bytes32 _root;
        uint _num;
        string _cid;
    }

    constructor(address _userRegister, validator[3] memory _validators, uint _slotLen, uint _slotNum, uint _transitionLen){
        // User register initialization
        userRegister = UserRegister(_userRegister);

        // epoch and slot initialization
        epoch = 0;

        slotNum = _slotNum;

        slotLen = _slotLen;

        slot[0] = block.number;
        slot[1] = block.number + slotLen;

        // transition initialization
        transitionLen = _transitionLen;
        transition[0] = slotNum * slotLen;
        transition[1] = transition[0] + _transitionLen;

        // Validator initialization
        for(uint i = 0; i < 3; i++){
            currentValidators[i] = nextValidators[i] = _validators[i];
        }
        currentValidator = _validators[0]._validator;

    }

    function stake() public payable {

    }

    function widthdraw() public {

    }

    function submitBlocks(address[] memory _contracts, oracleBlock[] memory _blocks) public {

    }

    function executeBlocks() public{

    }

    function disputeBlocks() public{

    }

    function transitionEpoch() public {

    }

}