// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

contract Asset{

    address public immutable distributor;

    uint8 public immutable assetType;

    modifier onlyDistributor{
        require(msg.sender == distributor, "Only asset distributor can call this function.");
        _;
    }

    constructor(uint8 _assetType){
        distributor = msg.sender;
        assetType = _assetType;
    }
}