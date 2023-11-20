// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import Wallet.sol 
import "./EtherWallet.sol";
// Import ERC20 from Openzeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Staking is  EtherWallet, ERC20 {
    
    event _WalletCreate(
       uint walletId, 
       address walletAddress
    );
    event _walletDeposit(
       uint WalletId, 
       uint ethAmount
    );
    event _walletWithdraw(
       uint WalletId, 
       uint ethAmount,
       address to
    );
    event _stakeEth(
       uint WalletId, 
       uint ethAmount

    );
    event _unstakeEth(
       uint WalletId, 
       uint ethAmount,
       uint rewards
    );

   
    struct CurrentStake{
        EtherWallet wallet;
        uint totalAmount;
        uint StartTimeStake;
        uint endTimeStake;
    }
    CurrentStake [] stakeWallet;

    // This defines the total percentage of reward(WEB3 ERC20 token) to be accumulated per second
    uint256 public constant percentPerBlock = 317; //10*- 9// Bonus Exercise: use more granular units

    //  Define the constructor and make sure to define the ERC20 token here
    constructor() ERC20("web3Fed","WF"){}

    // This should create a wallet for the user and return the wallet Id. The user can create as many wallets as they want
    function walletCreate() public returns (uint256 walletId) {
       EtherWallet wallet = new EtherWallet();
       stakeWallet.push(CurrentStake(wallet,0,0,0));
       emit _WalletCreate(stakeWallet.length-1, address(stakeWallet[stakeWallet.length-1].wallet));
       return stakeWallet.length-1;

    }
    

    // This will return the array of wallets
     function getWallets() public view returns (CurrentStake[] memory) {
        return stakeWallet;
     }

    // This should let users deposit any amount of ETH into their wallet
    function walletDeposit(uint256 _walletId)  public payable isWalletOwner(_walletId)
    {
        stakeWallet[_walletId].wallet.deposit{value: msg.value}();
        emit _walletDeposit(_walletId,msg.value);
    }

    // This will return the current amount of ETH for a particular wallet
    function walletBalance(uint256 _walletId) public view returns (uint256) {
        return stakeWallet[_walletId].wallet.myBalance();
    }

    // This should let users withdraw any amount of ETH from their wallet
    function walletWithdraw( uint256 _walletId, address payable _to, uint _amount) public payable isWalletOwner(_walletId) {
        stakeWallet[_walletId].wallet.withdraw(_to, _amount);
        emit _walletWithdraw(_walletId,_amount,_to);
    }

    /* This should let users stake the current ETH they have in their wallet to the staking pool. The user should 
      be able to stake additional amount of ETH into the staking pool whereby doing so will first reward the users with 
      the accumulated WEB3 ERC20 token and then reset the timestamp for the overall stake. When you stake your ETH into 
      the pool, what happens is the ETH is withdrawn from the wallet to the staking pool so make sure to call the withdraw 
      function of the wallet here to handle this.
    */
    function stakeEth(uint256 _walletId,uint _amountStake) public  isWalletOwner(_walletId) {
        require (stakeWallet[_walletId].wallet.myBalance() > 0, "hai zero fondi nel wallet");
        uint rewards = 0;
        // salvo quando finisce il tempo di stake per fare dopo il calcolo
         stakeWallet[_walletId].endTimeStake = block.timestamp;
        // mando al contratto della staking gli eth da mettere un stake
        walletWithdraw(_walletId, payable(this), _amountStake);
        /// controllo se sono maturati degli interessi
        if(stakeWallet[_walletId].endTimeStake - stakeWallet[_walletId].StartTimeStake > 0){
            //calcolare il total amount da inviare
            rewards  = uint((stakeWallet[_walletId].endTimeStake -stakeWallet[_walletId].StartTimeStake)*percentPerBlock*stakeWallet[_walletId].totalAmount/100000000000000000000);
            _mint(msg.sender, rewards);
            rewards = 0;
        }
        // inizio a contare i secondi di stake
        stakeWallet[_walletId].StartTimeStake = block.timestamp;
        // metto gli th nel contatore
        stakeWallet[_walletId].totalAmount = stakeWallet[_walletId].totalAmount + _amountStake;
        emit _stakeEth(_walletId,_amountStake);

    }

    //This will return the current amount of ETH that a particular wallet has staked in the staking pool
    function currentStake(uint256 _walletId) public view isWalletOwner(_walletId) returns (uint256) {
        return stakeWallet[_walletId].totalAmount;
    }

    // This will return the total unclaimed WEB3 ERC20 tokens based on the user’s stake in the staking pool
    function currentReward(uint256 _walletId) public view  isWalletOwner(_walletId) returns (uint256){
        return uint((block.timestamp -stakeWallet[_walletId].StartTimeStake)*percentPerBlock*stakeWallet[_walletId].totalAmount/100000000000000000000);
    }

    // This will return the total amount of wallets that are currently in the staking pool
    function totalAddressesStaked() public view returns (uint256) {
        uint totalAddress = 0;
        for(uint i = 0; i < stakeWallet.length; i++){
            if(stakeWallet[i].StartTimeStake > 0){
                totalAddress++;
            }
           
        }
         return totalAddress;
    }

    //  This will return true or false depending on whether a particular wallet is staked in the staking pool
    function isWalletStaked(uint256 _walletId) public view returns (bool) {
        if(stakeWallet[_walletId].StartTimeStake > 0){
            return true;
        }else 
            return false;
    }

    /*
      This should let users unstake all their ETH they have in the staking pool. Doing so will automatically mint 
      the appropriate amount of WEB3 ERC20 tokens that have been accumulated so far. When you unstake your ETH from the pool, 
      the ETH is withdrawn from the staking pool to the user wallet so make sure to call the transfer function to handle this.
    */
    function unstakeEth(uint256 _walletId) public payable isWalletOwner(_walletId)
    {
        // TODO: Ensure that the user hasn't already unstaked previously
        if(stakeWallet[_walletId].totalAmount == 0){
            revert("you have already done unstake");
        }
        //  Transfer eth from the staking pool(this contract) to the wallet(Wallet contract)
          uint rewards  = uint((stakeWallet[_walletId].endTimeStake -stakeWallet[_walletId].StartTimeStake)*percentPerBlock*stakeWallet[_walletId].totalAmount);
          payable(stakeWallet[_walletId].wallet).transfer(stakeWallet[_walletId].totalAmount);
        //  Reward with WEB3 tokens that the user had accumulated so far
        _mint(msg.sender, rewards);
         emit _unstakeEth(_walletId,stakeWallet[_walletId].totalAmount,rewards);
        stakeWallet[_walletId].totalAmount = 0;
        stakeWallet[_walletId].StartTimeStake = 0;
        stakeWallet[_walletId].endTimeStake = 0;
      
    }

    

    //  checks whether msg.sender is the owner of the wallet
    modifier isWalletOwner(uint _walletId) {
        require(stakeWallet[_walletId].wallet.owner() == msg.sender, "non sei il propietario");
        _;

    }
}