//SPDX-License-Identifier: unlicensed
pragma solidity 0.7.6;

import "./extension/Admin.sol";
import "./interface/IBridgeToken.sol";

contract Bridge is Admin {

    bool bridgeOn = true;    

    mapping(address => bool) public bridgeable;
    mapping(address => bool) public admins;
    event TokenSent(address, address, uint256);
    event TokenReceived(address, address, uint256);

    constructor() {
        _owner = msg.sender;
        admin[msg.sender] = true;          
    }
    

  function bridgeReceive(address _token, uint256 _amount, address _to) external onlyAdmin {
    if (bridgeable[_token]) {
        IBridgeToken token = IBridgeToken(_token);
        token.ownerMint(msg.sender, _amount);
        emit TokenReceived(_to, _token, _amount);
    } else {
        revert("Token isn't bridgeable :'(");
    }
}

function bridgeSent(address _token, uint256 _amount, address _to) external {
    if (bridgeable[_token]) {
        IBridgeToken token = IBridgeToken(_token);
        token.ownerBurn(msg.sender, _amount);
        emit TokenSent(_to, _token, _amount);
    } else {
        revert("Token isn't bridgeable :'(");
    }
}

    function addToken(address _token) external {
        bridgeable[_token] = true;
    }

    function removeToken(address _token) external {
        bridgeable[_token] = false;
    }

    function bridgeStatus(bool _status) external onlyOwner {
        bridgeOn = _status;
    }    

}
