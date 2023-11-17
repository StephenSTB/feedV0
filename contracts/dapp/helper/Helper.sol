// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "../user-register/UserRegister.sol";

library Helper{

    /*
    *   Helper functions
    */

    // Compare string _a and _b equality
    function compareStrings(string memory _a, string memory _b) internal pure returns(bool){
        return keccak256( abi.encodePacked( bytes(_a) ) )  == keccak256( abi.encodePacked( bytes(_b) ) );
    }

    // Determine is V1 JSON CID
    function isV1JSONCID(string memory _cid) internal pure returns(bool){
        return keccak256( abi.encodePacked( bytes9( bytes(_cid) ) ) ) == keccak256( abi.encodePacked( bytes9("bagaaiera") ) ) && bytes(_cid).length == 61;
    }

    // dag cbor base32 sha256 prefix bafyrei
    function isV1CBORCID(string memory _cid) internal pure returns(bool){
        return keccak256( abi.encodePacked( bytes7( bytes(_cid) ) ) ) == keccak256( abi.encodePacked( bytes7("bafyrei") ) ) && bytes(_cid).length == 59;
    }

    // dag pg base32 sha256 prefix bafybei
    function isV1PBCID(string memory _cid) internal pure returns(bool){
        return keccak256( abi.encodePacked( bytes7( bytes(_cid) ) ) ) == keccak256( abi.encodePacked( bytes7("bafybei") ) ) && bytes(_cid).length == 59;
    }

    function isV1RawCID(string memory _cid) internal pure returns(bool){
        return keccak256( abi.encodePacked( bytes7( bytes(_cid) ) ) ) == keccak256( abi.encodePacked( bytes7("bafkrei") ) ) && bytes(_cid).length == 59;
    }

    // Determine is V0CID.
    function isV0CID(string memory _cid) internal pure returns(bool){
        require(keccak256( abi.encodePacked( bytes2( bytes(_cid) ) ) ) == keccak256( abi.encodePacked( bytes2("Qm") ) ),  "Invalid CIDV0 prefix.");
        require(bytes(_cid).length == 46, "Invalid CIDV0 string length");
        return true;
    }

    // Determine if the cid has correct prefix
    function cidV0Prefix(string memory _cid) internal pure returns(bool){
        return  keccak256( abi.encodePacked( bytes2( bytes(_cid) ) ) ) == keccak256( abi.encodePacked( bytes2("Qm") ) ) ;
    }
    // Determine if the cid has correct length
    function cidV0Length(string memory _cid) internal pure returns(bool){
        return bytes(_cid).length == 46;
    }

}