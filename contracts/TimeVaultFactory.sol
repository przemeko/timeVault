pragma solidity ^0.4.20;

import "./TimeVault.sol";

contract TimeVaultFactory {
    address owner;

    constructor() public {
        owner = msg.sender;
    }

    function create(address destination, uint value, bytes data, uint blockedUntil) public returns (address) {
        TimeVault timeVaultContract = new TimeVault(msg.sender, destination, value, data, blockedUntil);

        return address(timeVaultContract);
    }
}