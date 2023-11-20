const {loadFixture } = require ('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require ('hardhat');

describe('deploy', function() {
    async function deployFixture() {
        // destructuring assignment" assegno l oggetto/array signer che ha piu valori, il primo a owner e il secondo a otherAccount
        // parentesi [] per array e parentesi {} per oggetti
        //console.log(await ethers.getSigners() );
        const [firstAccount, otherAccount,] = await ethers.getSigners();


       // console.log(await ethers.getContractFactory('EtherWallet') );
        const Staking = await ethers.getContractFactory('Staking');
        const staking = await Staking.deploy();

        

        return { staking ,firstAccount, otherAccount};


    }

    async function helperMineNBlocks(n) {
        for (let index = 0; index < n; index++) {
          await ethers.provider.send('evm_mine')
        }
    }

    describe('walletCreate', function(){
        it('This should create a wallet for the user and return the wallet Id. The user can create as many wallets as they want', async function(){
            const { staking , firstAccount, otherAccount} = await loadFixture(deployFixture);
            // Chiama la funzione walletCreate
            const id = await staking.connect(firstAccount).walletCreate();
            const id1 = await staking.connect(otherAccount).walletCreate();
            const id2 = await staking.connect(firstAccount).walletCreate();
            
            const stakeWallet = await staking.getWallets();

            expect( stakeWallet[0].wallet).to.not.be.empty;
            expect( stakeWallet[1].wallet).to.not.be.empty;
            expect( stakeWallet[2].wallet).to.not.be.empty;

        })
    })

    describe('walletDeposit', function(){
        it('should deposit Ether to the contract', async function(){
            const { staking , firstAccount , otherAccount} = await loadFixture(deployFixture);
            //// creo il wallet
            await staking.connect(firstAccount).walletCreate();
            // controllo che solo il proprietario possa accedere alla funzione
            await expect(staking.connect(otherAccount).walletDeposit(0, {value: ethers.parseEther('1')})).to.be.revertedWith("non sei il propietario"); 
            //controllo che il balance alla creazione sia 0
            const balance = await staking.connect(firstAccount).walletBalance(0);
            expect(balance.toString()).to.equal(ethers.parseEther('0'));
            /// deposito eth nel wallet
            await staking.connect(firstAccount).walletDeposit(0, {value: ethers.parseEther('1')})         
            // controllo che il bilancio sia giusto
            const balanceAfter = await staking.connect(firstAccount).walletBalance(0);
            expect(balanceAfter.toString()).to.equal(ethers.parseEther('1'));

        })

    })
    describe('walletWithdraw', function(){
        it('should withdraw Ether to the contract', async function(){
        const { staking , firstAccount, otherAccount} = await loadFixture(deployFixture);
        //creo il wallet
        await staking.connect(firstAccount).walletCreate();
        /// deposito eth nel wallet
        const balancePartenza =  await ethers.provider.getBalance(otherAccount.address);
        await staking.connect(firstAccount).walletDeposit(0, {value: ethers.parseEther('1')})
        //faccio il withdraw
        await staking.connect(firstAccount).walletWithdraw(0,otherAccount.address,ethers.parseEther('1'))
        const balance =  await ethers.provider.getBalance(otherAccount.address);
        const balanceAfter = await staking.connect(firstAccount).walletBalance(0);
        ///controllo che gli ether siano andati all altro indirizzo
        expect(balance).to.equal(balancePartenza+ethers.parseEther('1'));
        ///controllo che gli eth sia andati vai dall indirizzo di partenza
        expect(balanceAfter).to.equal(ethers.parseEther('0'));
        })
    })

    describe('stakingEth', function(){
        it('stake eth into contract, send rewards', async function(){
            const { staking , firstAccount, otherAccount} = await loadFixture(deployFixture);
            //creo il wallet
            await staking.connect(firstAccount).walletCreate();
            //provo a mettere in stake anche se non ho eth
            await expect(staking.connect(firstAccount).stakeEth(0,ethers.parseEther('1'))).to.be.revertedWith("hai zero fondi nel wallet");
            //deposito gli eth nel wallet
            const tx = await staking.connect(firstAccount).walletDeposit(0, {value: ethers.parseEther('2')})
            //deposito 1eth in stake
            await staking.connect(firstAccount).stakeEth(0,ethers.parseEther('1'));
            //controllo che sia stato depositato nel contratto
            const balance =  await ethers.provider.getBalance(staking);
            expect(balance).to.equal(ethers.parseEther('1'));
            const stakeWallet = await staking.getWallets();
            expect(stakeWallet[0].StartTimeStake).to.not.be.null;
            /// controllo che sia stato aggiunto al contatore del contratto
            expect(stakeWallet[0].totalAmount).to.equal(ethers.parseEther('1'));
            
            //deposito 1eth in stake
            await staking.connect(firstAccount).stakeEth(0,ethers.parseEther('1'));
            
            expect(stakeWallet[0].endTimeStake).to.not.be.null;
            expect(stakeWallet[0].StartTimeStake).to.not.be.null;



            
        })

    })
    
    describe('currentStake', function(){
        it('This will return the current amount of ETH that a particular wallet has staked in the staking pool', async function(){
            const { staking , firstAccount, otherAccount} = await loadFixture(deployFixture);
            //creo il wallet
            await staking.connect(firstAccount).walletCreate();
            //deposito gli eth nel wallet
            await staking.connect(firstAccount).walletDeposit(0, {value: ethers.parseEther('2')})
            //deposito 1eth in stake
            await staking.connect(firstAccount).stakeEth(0,ethers.parseEther('1'));
            //controllo quanti eth ha un utente in stake
            const currentStake = await staking.connect(firstAccount).currentStake(0);
            // mi aspetto 1 siccome ne ho caricato 1
            expect(currentStake).to.equal(ethers.parseEther('1'));
          


        })

    })
    describe('currentReward', function(){
        it('This will return the total unclaimed WEB3 ERC20 tokens based on the user’s stake in the staking pool', async function(){
            const { staking , firstAccount, otherAccount} = await loadFixture(deployFixture);
            //creo il wallet
            await staking.connect(firstAccount).walletCreate();
            //deposito gli eth nel wallet
            await staking.connect(firstAccount).walletDeposit(0, {value: ethers.parseEther('2')})
            //deposito 1eth in stake
            await staking.connect(firstAccount).stakeEth(0,ethers.parseEther('1'));
            //aspetto tot blocchi
            await helperMineNBlocks(1000);
            //// ne deposito un altro
            await staking.connect(firstAccount).stakeEth(0,ethers.parseEther('1'));
            // calcolo le rewards
            const currentRewards =  await staking.connect(firstAccount).currentReward(0);
          
            expect(currentRewards).to.not.be.null;
        })

    })
    describe('totalAddressesStaked', function(){
        it('This will return the total amount of wallets that are currently in the staking pool', async function(){
            const { staking , firstAccount, otherAccount} = await loadFixture(deployFixture);
            //creo il wallet
            await staking.connect(firstAccount).walletCreate();
            //deposito gli eth nel wallet
            await staking.connect(firstAccount).walletDeposit(0, {value: ethers.parseEther('2')})
            //deposito 1eth in stake
            await staking.connect(firstAccount).stakeEth(0,ethers.parseEther('1'));
            const totalAddressesStaked = await staking.totalAddressesStaked();
          
            expect(totalAddressesStaked).to.equal(1);

          
            await staking.connect(otherAccount).walletCreate();
            //deposito gli eth nel wallet
            
            await staking.connect(otherAccount).walletDeposit(1, {value: ethers.parseEther('2')})
            //deposito 1eth in stake
            await staking.connect(otherAccount).stakeEth(1,ethers.parseEther('1'));

            const totalAddressesStaked2 = await staking.totalAddressesStaked();
            expect(totalAddressesStaked2).to.equal(2);
        })

    })


    describe('isWalletStaked', function(){
        it('This will return true or false depending on whether a particular wallet is staked in the staking pool', async function(){
            const { staking , firstAccount, otherAccount} = await loadFixture(deployFixture);
            //creo il wallet
            await staking.connect(firstAccount).walletCreate();
            //deposito gli eth nel wallet
            await staking.connect(firstAccount).walletDeposit(0, {value: ethers.parseEther('2')})
            //deposito 1eth in stake
            await staking.connect(firstAccount).stakeEth(0,ethers.parseEther('1'));
            const isWalletStaked = await staking.connect(firstAccount).isWalletStaked(0);
          
            expect(isWalletStaked).to.equal(true);

        })

    })
    describe('unstakeEth', function(){
        it('This will return This should let users unstake all their ETH they have in the staking pool', async function(){
            const { staking , firstAccount, otherAccount} = await loadFixture(deployFixture);
            //creo il wallet
            await staking.connect(firstAccount).walletCreate();
            //provo unstake per revert
            await expect(staking.connect(firstAccount).unstakeEth(0)).to.be.revertedWith("you have already done unstake");
            //deposito gli eth nel wallet
            await staking.connect(firstAccount).walletDeposit(0, {value: ethers.parseEther('1')})
            //deposito 1eth in stake
            await staking.connect(firstAccount).stakeEth(0,ethers.parseEther('1'));
            ///faccio unstake
            await staking.connect(firstAccount).unstakeEth(0);
            ///
            const stakeWallet = await staking.getWallets();
            expect(stakeWallet[0].totalAmount).to.equal(0);
            expect(stakeWallet[0].StartTimeStake).to.equal(0);
            expect(stakeWallet[0].StartTimeStake).to.equal(0);
            /// balance del wallet ritorni
            const balance =  await ethers.provider.getBalance(stakeWallet[0].wallet);
            expect(balance).to.equal(ethers.parseEther('1'));

            

        })

    })

   
})
