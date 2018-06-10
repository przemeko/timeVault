pragma solidity ^0.4.20;

import "./Ownable.sol";

contract TimeVault is Ownable {
    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool isExecuted;
        uint blockedUntil;
    }

    Transaction public transaction;

    event ContractCreated(address contractAddress, address owner, address destination);
    event ContractExecuted(address contractAddress);

    constructor(address sender, address destination, uint value, bytes data, uint blockedUntil) public {
        owner = sender;
        transaction = Transaction(destination, value, data, false, blockedUntil);

        emit ContractCreated(address(this), owner, destination);
    }

    function execute() public onlyOwner returns (bool) {
        require(transaction.isExecuted == false, "Smart contract already executed.");
        require(now > transaction.blockedUntil, "Transaction is still blocked.");

        bool isSuccess = external_call(transaction.destination, transaction.value, transaction.data.length, transaction.data);
        if (isSuccess) {
            transaction.isExecuted = true;
            emit ContractExecuted(address(this));
        }

        return isSuccess;
    }

    function isExecuted() public view returns (bool) {
        return transaction.isExecuted;
    }

    // call has been separated into its own function in order to take advantage
    // of the Solidity's code generator to produce a loop that copies tx.data into memory.
    function external_call(address destination, uint value, uint dataLength, bytes data) private returns (bool) {
        bool result;
        assembly {
            let x := mload(0x40)   // "Allocate" memory for output (0x40 is where "free memory" pointer is stored by convention)
            let d := add(data, 32) // First 32 bytes are the padded length of data, so exclude that
            result := call(
                sub(gas, 34710),   // 34710 is the value that solidity is currently emitting
                                   // It includes callGas (700) + callVeryLow (3, to pay for SUB) + callValueTransferGas (9000) +
                                   // callNewAccountGas (25000, in case the destination address does not exist and needs creating)
                destination,
                value,
                d,
                dataLength,        // Size of the input (in bytes) - this is what fixes the padding problem
                x,
                0                  // Output is ignored, therefore the output size is zero
            )
        }
        return result;
    }
}