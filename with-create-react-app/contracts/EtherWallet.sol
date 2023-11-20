// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;


contract EtherWallet {
   
    address payable public owner;

    constructor (){
         owner = payable(tx.origin);
    }

    function deposit() payable public {
      
    }

    function withdraw(address payable reciver, uint amount) public onlyOwner() {
      reciver.transfer(amount);
    }

    // Todo: Add a function to view the current balance for your own wallet
    function myBalance() view public returns(uint) {
       return  address(this).balance;
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(tx.origin == owner, "Not an owner of the wallet");
        _;
    }
}
