pragma solidity ^0.8.17;

import "../../user-register/UserRegister.sol";

import "../Feed.sol";

contract FeedViewer{
    UserRegister userRegister;
    Feed feed;

    struct post_info{
        address _user;
        string _cid;  
        uint _index;
        uint _totalComments;
        uint _totalDonations; 
        uint _totalDonated;
        uint _reposts;
        uint _block;
        uint _timestamp;
    }

    struct comment_info{
        address _user;
        string _cid;
        uint _totalDonations;
        uint _totalDonated;
        uint _block;
        uint _timestamp;
    }

    struct donation_info{
        address _user;
        string _cid;
        uint _value;
        uint _block;
        uint _timestamp;
    }
    constructor(address _userRegister, address _feed){
        userRegister = UserRegister(_userRegister);
        feed = Feed(_feed);
    }
    // Retrieve Posts
    function retrieve_post(uint _postId) public view returns(post_info memory _post){
        (address _user, string memory _cid, uint _index, uint _totalComments, uint _totalDonations, uint _totalDonated, uint _reposts, uint _block, uint _timestamp) = feed.retrieve_post(_postId);
        _post = post_info(_user, _cid, _index, _totalComments, _totalDonations, _totalDonated, _reposts, _block, _timestamp);
    }
    
    function retrieve_posts(uint _start, uint _end) public view returns(post_info[] memory _posts){
        require(feed.validStartEnd(_start, _end, feed.postId()));
        _posts = new post_info[](_end - _start + 1);
        for(uint i = 0; i <= _end - _start; i++){
            _posts[i] = retrieve_post(_start + i);
        }
    }
    
    function retrieve_posts(address _following, uint _start, uint _end) public view returns(post_info[] memory _posts){
        require(userRegister.isUser(_following), "Following must be registered.");
        require(feed.validStartEnd(_start, _end, feed.userFeedLength(_following)));
        _posts = new post_info[](_end - _start + 1);
        for(uint i = 0; i <= _end - _start; i++){    
            _posts[i] = retrieve_post(feed.userFeed(_following, _start + i));
        }
    }
    
    // Retrieve Comments
    function retrieve_comment(uint _postId, uint _commentId) public view returns(comment_info memory _comment){
        (address _user, string memory _cid, uint _totalDonations, uint _totalDonated, uint _block, uint _timestamp) = feed.retrieve_comment(_postId, _commentId);
        _comment = comment_info(_user, _cid, _totalDonations, _totalDonated, _block, _timestamp);
    }
    
    function retrieve_comments(uint _postId, uint _start, uint _end) public view returns(comment_info[] memory _comments){
        require(feed.validPost(_postId));
        require(feed.validStartEnd(_start, _end, feed.totalComments(_postId)));
        _comments = new comment_info[](_end - _start + 1);
        for(uint i = 0; i <= _end - _start; i++){
            _comments[i] = retrieve_comment(_postId, _start + i);
        }
    }

    function retrieve_comments(address _following, uint _postNum,  uint _start, uint _end) public view returns(comment_info[] memory _comments){
        require(userRegister.isUser(_following), "Following must be registered.");
        require(_postNum < feed.userFeedLength(_following), "Invalid _postNum");
        require(feed.validPost(feed.userFeed(_following, _postNum)));
        require(feed.validStartEnd(_start, _end, feed.totalComments(feed.userFeed(_following, _postNum))));
        _comments = new comment_info[](_end - _start + 1);
        for(uint i = 0; i <= _end - _start; i++){
            _comments[i] = retrieve_comment(feed.userFeed(_following, _postNum), _start + i);
        }
    }
    
    // Retrieve Donations
     function retrieve_post_donation(uint _postId, uint _donationId) public view returns(donation_info memory _dono){
        (address _user, string memory _cid, uint _value, uint _block, uint _timestamp) = feed.retrieve_post_donation(_postId, _donationId);
        _dono = donation_info(_user, _cid, _value, _block, _timestamp);
    }
    
    function retrieve_post_donations(uint _postId, uint _start, uint _end) public view returns(donation_info[] memory _donos){
        require(feed.validPost(_postId));
        require(feed.validStartEnd(_start, _end, feed.totalDonations(_postId)));
        _donos = new donation_info[](_end - _start + 1);
        for(uint i = 0; i <= _end - _start; i++){
            _donos[i] = retrieve_post_donation(_postId, _start + i);
        }
    }

    function retrieve_post_donations(address _following, uint _postNum, uint _start, uint _end) public view returns(donation_info[] memory _donos){
        require(userRegister.isUser(_following), "Following must be registered.");
        require(_postNum < feed.userFeedLength(_following), "Invalid _postNum");
        uint _postId = feed.userFeed(_following, _postNum);
        require(feed.validPost(_postId));
        require(feed.validStartEnd(_start, _end, feed.totalDonations(_postId)));
        _donos = new donation_info[](_end - _start + 1);
        for(uint i = 0; i <= _end - _start; i++){
            _donos[i] = retrieve_post_donation(_postId, _start + i);
        }
    }

    function retrieve_comment_donation(uint _postId, uint _commentId, uint _donationId) public view returns(donation_info memory _dono){
        (address _user, string memory _cid, uint _value, uint _block, uint _timestamp) = feed.retrieve_comment_donation(_postId, _commentId, _donationId);
        _dono = donation_info(_user, _cid, _value, _block, _timestamp);
    }

    function retrieve_comment_donations(uint _postId, uint _commentId, uint _start, uint _end) public view returns(donation_info[] memory _donos){
        require(feed.validComment(_postId, _commentId));
        require(feed.validStartEnd(_start, _end, feed.totalCommentDonations(_postId, _commentId)));
        _donos = new donation_info[](_end - _start + 1);
        for(uint i = 0; i <= _end - _start; i++){
            _donos[i] = retrieve_comment_donation(_postId, _commentId, _start + i);
        }
    }

    function retrieve_comment_donations(address _following, uint _postNum, uint _commentId, uint _start, uint _end) public view returns(donation_info[] memory _donos){
        require(userRegister.isUser(_following), "Following must be registered.");
        uint _postId = feed.userFeed(_following, _postNum);
        require(_postNum < feed.userFeedLength(_following), "Invalid _postNum");
        require(feed.validComment(_postId, _commentId));
        require(feed.validStartEnd(_start, _end, feed.totalCommentDonations(_postId, _commentId)));
        _donos = new donation_info[](_end - _start + 1);
        for(uint i = 0; i <= _end - _start; i++){
            _donos[i] = retrieve_comment_donation(_postId, _commentId, _start + i);
        }
    }
}
