
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../user-register/UserRegister.sol";

import "../helper/Helper.sol";

contract Feed {
    
    UserRegister userRegister;

    uint public postId = 0;

    mapping(address => uint[]) public userFeed;

    mapping(uint => post) public feed;

    struct post {
        address _user;
        string _cid;  
        uint _index;   
        uint _totalComments;
        mapping(uint => comment) _comments;
        uint _totalDonations;
        mapping(uint => donation) _donations;
        uint _totalDonated;
        uint _reposts;
        uint _block;
        uint _timestamp;
    }

    struct comment {
        address _user;
        string _cid;
        uint _totalDonations;
        mapping(uint => donation) _donations;
        uint _totalDonated;
        uint _block;
        uint _timestamp;
    }

    struct donation{
        address _user;
        string _cid;
        uint _value;
        uint _block;
        uint _timestamp;
    }

    event posted (uint _postId, address _user, string _cid);

    event commented (uint _postId, uint _commentId, address _user, string _cid);

    event donated_post (uint _postId, address _user, string _cid);

    event donated_comment (uint _postId, uint _commentId, address _user, string _cid);

    modifier isUser(){
        require(userRegister.isUser(msg.sender), "Sender must be registered.");
        _;
    }

    constructor(address _userRegister){
        userRegister = UserRegister(_userRegister);
    }

    function _baseURI() internal pure returns(string memory){
        return "ipfs://";
    }

    function tokenURI(uint _postId) public view returns(string memory){
        require(validPost(_postId));
        return string(abi.encodePacked(_baseURI(), feed[_postId]._cid)); 
    }

    function submit(string memory _cid) public isUser returns(uint _postId){
        require(Helper.isV1JSONCID(_cid), "Invalid post JSON CID.");
        _postId = postId++;
        userFeed[msg.sender].push(_postId);
        feed[_postId]._user = msg.sender;
        feed[_postId]._cid = _cid;
        feed[_postId]._index = userFeed[msg.sender].length - 1;
        feed[_postId]._block = block.number;
        feed[_postId]._timestamp = block.timestamp;
        emit posted(_postId, msg.sender, _cid);
    }

    function remove(uint _postId) public isUser{
        require(validPost(_postId));
        require(feed[_postId]._user == msg.sender, "Post user must be sender.");
        delete userFeed[msg.sender][feed[_postId]._index];
        delete feed[_postId];
    }

    function retrieve_post(uint _postId) public view returns(address _user, string memory _cid, uint _index, uint _totalComments, uint _totalDonations, uint _totalDonated, uint _reposts, uint _block, uint _timestamp){
        require(validPost(_postId));
        _user = feed[_postId]._user;
        _cid = feed[_postId]._cid;
        _index = feed[_postId]._index;
        _totalComments = feed[_postId]._totalComments;
        _totalDonations = feed[_postId]._totalDonations;
        _totalDonated = feed[_postId]._totalDonated;
        _reposts = feed[_postId]._reposts;
        _block = feed[_postId]._block;
        _timestamp = feed[_postId]._timestamp;
    }

    function repost(uint _postId) public isUser{
        require(validPost(_postId));
        feed[_postId]._reposts++;
        userFeed[msg.sender].push(_postId);
    }

    function remove_repost(uint _index) public isUser{
        require(_index < userFeedLength(msg.sender), "Invalid user feed length.");
        require(feed[userFeed[msg.sender][_index]]._user != msg.sender, "Invalid post user, Use remove to remove normal post.");
        delete userFeed[msg.sender][_index];
    }

    function submit_comment(uint _postId, string memory _cid) public payable isUser{
        require(validPost(_postId));
        require(Helper.isV1JSONCID(_cid), "Invalid comment JSON CID.");
        require(userRegister.validInteraction{value: msg.value}(feed[_postId]._user, msg.sender));
        uint _totalComments = feed[_postId]._totalComments++;
        feed[_postId]._comments[_totalComments]._user = msg.sender;
        feed[_postId]._comments[_totalComments]._cid = _cid;
        feed[_postId]._comments[_totalComments]._block = block.number;
        feed[_postId]._comments[_totalComments]._timestamp = block.timestamp;
        emit commented(_postId, _totalComments, msg.sender, _cid);
    }

    function remove_comment(uint _postId, uint _commentId) public isUser{
        require(validPost(_postId));
        require(feed[_postId]._user == msg.sender, "Post user must be sender.");
        require(_commentId < feed[_postId]._totalComments, "Invalid commentId");
        delete feed[_postId]._comments[_commentId];
    }

    function withdraw_comment(uint _postId, uint _commentId) public isUser{
        require(validPost(_postId));
        require(_commentId <= feed[_postId]._totalComments, "Invalid commentId");
        require(feed[_postId]._comments[_commentId]._user == msg.sender, "Invalid commenter");
        feed[_postId]._comments[_commentId]._cid = "";
    }

    function retrieve_comment(uint _postId, uint _commentId) public view returns(address _user, string memory _cid, uint _totalDonations, uint _totalDonated, uint _block, uint _timestamp){
        require(validComment(_postId, _commentId));
        _user = feed[_postId]._comments[_commentId]._user;
        _cid = feed[_postId]._comments[_commentId]._cid;
        _totalDonations = feed[_postId]._comments[_commentId]._totalDonations;
        _totalDonated = feed[_postId]._comments[_commentId]._totalDonated;
        _block = feed[_postId]._comments[_commentId]._block;
        _timestamp = feed[_postId]._comments[_commentId]._timestamp;
    }

    function donate(uint _postId, string memory _cid) public payable isUser{
        require(validPost(_postId));
        require(Helper.isV1JSONCID(_cid), "Invalid donation JSON CID.");
        require(userRegister.validInteraction{value: msg.value}(feed[_postId]._user, msg.sender));
        feed[_postId]._totalDonated += msg.value;
        uint _totalDonations = feed[_postId]._totalDonations++;
        feed[_postId]._donations[_totalDonations]._user = msg.sender;
        feed[_postId]._donations[_totalDonations]._value = msg.value;
        feed[_postId]._donations[_totalDonations]._cid = _cid;
        feed[_postId]._donations[_totalDonations]._block = block.number;
        feed[_postId]._donations[_totalDonations]._timestamp = block.timestamp;
        emit donated_post(_postId, msg.sender, _cid);
    }
    
    function donate(uint _postId, uint _commentId, string memory _cid) public payable isUser{
        require(validComment(_postId, _commentId));
        require(Helper.isV1JSONCID(_cid), "Invalid donation JSON CID.");
        require(feed[_postId]._comments[_commentId]._user != address(0), "Comment was deleted");
        require(userRegister.validInteraction{value: msg.value}(feed[_postId]._comments[_commentId]._user, msg.sender));
        feed[_postId]._comments[_commentId]._totalDonated += msg.value;
        uint _totalDonations = feed[_postId]._comments[_commentId]._totalDonations++;
        feed[_postId]._comments[_commentId]._donations[_totalDonations]._user = msg.sender;
        feed[_postId]._comments[_commentId]._donations[_totalDonations]._value = msg.value;
        feed[_postId]._comments[_commentId]._donations[_totalDonations]._cid = _cid;
        feed[_postId]._comments[_commentId]._donations[_totalDonations]._block = block.number;
        feed[_postId]._comments[_commentId]._donations[_totalDonations]._timestamp = block.timestamp;
        emit donated_comment(_postId, _commentId, msg.sender, _cid);
    }

    function retrieve_post_donation(uint _postId, uint _donationId) public view returns(address _user, string memory _cid, uint _value, uint _block, uint _timestamp){
        require(validPostDonation(_postId, _donationId));
        _user = feed[_postId]._donations[_donationId]._user;
        _cid = feed[_postId]._donations[_donationId]._cid;
        _value = feed[_postId]._donations[_donationId]._value;
        _block = feed[_postId]._donations[_donationId]._block;
        _timestamp = feed[_postId]._donations[_donationId]._timestamp;
    }

    function retrieve_comment_donation(uint _postId, uint _commentId, uint _donationId) public view returns(address _user, string memory _cid, uint _value, uint _block, uint _timestamp){
        require(validCommentDonation(_postId, _commentId, _donationId));
        _user = feed[_postId]._comments[_commentId]._donations[_donationId]._user;
        _cid = feed[_postId]._comments[_commentId]._donations[_donationId]._cid;
        _value = feed[_postId]._comments[_commentId]._donations[_donationId]._value;
        _block = feed[_postId]._comments[_commentId]._donations[_donationId]._block;
        _timestamp = feed[_postId]._comments[_commentId]._donations[_donationId]._timestamp;
    }

    // helper methods
    function validPost(uint _postId) public view returns(bool){
        require(_postId < postId, "Invalid _postId");
        require(feed[_postId]._user != address(0), "Post was removed");
        return true;
    }

    function validComment(uint _postId, uint _commentId) public view returns(bool){
        require(validPost(_postId));
        require(_commentId < feed[_postId]._totalComments, "Invalid _commentId");
        return true;
    }

    function validPostDonation(uint _postId, uint _donationId) public view returns(bool){
        require(validPost(_postId));
        require(_donationId < feed[_postId]._totalDonations, "Invalid _donationId");
        return true;
    }

    function validCommentDonation(uint _postId, uint _commentId, uint _donationId) public view returns(bool){
        require(validComment(_postId, _commentId));
        require(_donationId < feed[_postId]._comments[_commentId]._totalDonations, "Invalid _donationId");
        return true;
    }

    function validStartEnd(uint _start, uint _end, uint _arrLen) public pure returns(bool){
        require(_end > _start && _end - _start < 100 && _end < _arrLen, "Invalid _start / _end values.");
        return true;
    }

    function userFeedLength(address _user) public view returns(uint _length){
        return userFeed[_user].length;
    }

    function totalComments(uint _postId) public view returns (uint _totalComments){
        return feed[_postId]._totalComments;
    }

    function totalDonations(uint _postId) public view returns (uint _totalDonations){
        return feed[_postId]._totalDonations;
    }

    function totalCommentDonations(uint _postId, uint _commentId) public view returns(uint _totalDonations){
        return feed[_postId]._comments[_commentId]._totalDonations;
    }
    
}