pragma solidity ^0.4.20;

contract TestToken {
    address public owner;
    mapping (address => int256) public balances;
    address[] public balancesAddresses;
    
    event Transfer(address from, address to, int256 value);

    constructor() public {
        owner = msg.sender;
    }
    
    function balanceOf(address addr) public view returns (int256) {
        return balances[addr];
    }
    
    function transfer(address to, int256 value) public {
        balances[msg.sender] -= value;
        balances[to] += value;

        emit Transfer(msg.sender, to, value);
    }
    
    function generate(int256 value) public {
        if (balances[msg.sender] <= 0) {
            balancesAddresses.push(msg.sender);
        }

        balances[msg.sender] += value;
    }

    function getAddresses() public view returns (address[]) {
        return balancesAddresses;
    }
}