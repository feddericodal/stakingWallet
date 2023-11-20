import { ConnectButton } from '@rainbow-me/rainbowkit';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState , useEffect} from 'react';
import Staking from "./contractABI/Staking.json";
import { useContractRead} from 'wagmi';
import { readContract, writeContract , getWalletClient} from '@wagmi/core'
import { useWalletClient } from 'wagmi' //old useSIgner
import { useContractWrite, usePrepareContractWrite } from 'wagmi' 
const { ethers } = require("ethers");





const App = () => {

  
  const scaddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
  const[id , setId] = useState(0);
  const[amountEth, setAmountEth] = useState(0);
  const[addressWithdraw, setAddressWithdraw] = useState("");
  const [amountEthStake, setAmountEthStake] = useState(0);


  
 
/////////////////////////create wallet
async function CreateWallet(){
    try{
        const  walletCreate = writeContract({  
          address: scaddress,
          abi: Staking,
          functionName: 'walletCreate',
        });
        await walletCreate;
        ///leggo w visualizzo a schermo
        const  readWalletCreate = readContract({ 
          address: scaddress,
          abi: Staking,
          functionName: 'walletCreate',
        });
        console.log(await readWalletCreate); 
        const _id = await readWalletCreate;
        window.alert("hai creato un nuovo wallet il tuo id è:  "+ ( Number(_id)-1) );
    }catch(err){
        console.log(err)
    }

}

///////////////////////////////////// see your balance
async function Balance(){
  try{
    const  walletBalance = readContract({ 
      address: scaddress,
      abi: Staking,
      functionName: 'walletBalance',
      args:[id]
    });
    console.log( await walletBalance);
    window.alert("il tuo balance è:  "+ Number(await walletBalance)/ 10 ** 18 + "ETH");

  }catch(err){
    console.log("errore a leggere il balance: " + err);
  }

}
///////////////////deposit Eth
async function DepositEth(){
  try{
    const  walletDeposit = writeContract({  
      address: scaddress,
      abi: Staking,
      functionName: 'walletDeposit',
      args: [id],
      value: ethers.parseEther(String(amountEth))
    });
    console.log(await walletDeposit);
   
}catch(err){
    console.log(err)
}


}

//////////////////walletWithdraw
async function WithdrawEth(){
  try{
    const  WithdrawEth = writeContract({  
      address: scaddress,
      abi: Staking,
      functionName: 'walletWithdraw',
      args: [id, addressWithdraw, ethers.parseEther(String(amountEth))]
    });
    console.log(await WithdrawEth);
   
  }catch(err){
    console.log(err)
   }

}

////////////////stake your eth
async function Stake() {
  try{
    const  stakeEth = writeContract({  
      address: scaddress,
      abi: Staking,
      functionName: 'stakeEth',
      args: [id, ethers.parseEther(String(amountEthStake))],
    });
    console.log(await stakeEth);
   
}catch(err){
    console.log(err)
}


  
}
//////////checkyourstake
async function ControllStake(){
  
  try{
    const walletClient = await getWalletClient();
    const prova = walletClient?.account
    console.log(prova);
    const  currentStake = readContract({  
      address: scaddress,
      abi: Staking,
      functionName: 'currentStake',
      args: [id],
      account: prova
    });
    console.log(await currentStake);
    window.alert("il tuo balance è:  "+ Number(await currentStake)/ 10 ** 18 + " ETH");
   
  }catch(err){
    console.log(err)
  }
}

/////////////////////current rewards
async function CurrentReward(){
  
  try{
    const walletClient = await getWalletClient();
    const prova = walletClient?.account
    console.log(prova);
    const  currentReward = readContract({  
      address: scaddress,
      abi: Staking,
      functionName: 'currentReward',
      args: [id],
      account: prova
    });
    console.log(await currentReward);
    window.alert("hai accumulato:  "+ Number(await currentReward)/ 10 ** 18 + " WF");
   
  }catch(err){
    console.log(err)
  }
}

////////////////unstakeEth
async function Unstake(){
  try{
    const  unstakeEth = writeContract({  
      address: scaddress,
      abi: Staking,
      functionName: 'unstakeEth',
      args: [id],
    });
    console.log(await unstakeEth);
    window.alert("unstake effettuato");
   
  }catch(err){
    console.log(err)
}

}
////////////check if your wallet is staked
async function checkStaked(){
  try{
    const  isWalletStaked = readContract({ 
      address: scaddress,
      abi: Staking,
      functionName: 'isWalletStaked',
      args:[id]
    });
    console.log( await isWalletStaked);
    window.alert("il tuo wallet è staked: " + await isWalletStaked);

  }catch(err){
    console.log("errore a leggere isstaked " + err);
  }


}
//////////////show total address staked
async function TotalStaked(){
  try{
    const  totalAddressesStaked = readContract({ 
      address: scaddress,
      abi: Staking,
      functionName: 'totalAddressesStaked',
      args:[]
    });
    console.log( await totalAddressesStaked);
    window.alert("total address staked: " + await totalAddressesStaked);

  }catch(err){
    console.log("errore a leggere totalstaked " + err);
  }


}

 
  return (
    <>
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 12,

      }}
    >
      <ConnectButton />
  
    </div >
    <div style={{padding: 40, float: 'left'}}>
   
    <h3>Staking Smart Contract Address: {/*scaddress*/}</h3>
    
   
    <h3 className = "text=5x1 font-bold mb-20"> {"Deposit your eth to the stakingPool to earn WF:"} </h3>
          
    <Form>
      <Form.Group className ="mb-3" controlId ="CreateWallet">
        <p><b>Press the button if you want create a new wallet</b></p>
        <Button variant = "success"  onClick={() => CreateWallet()} > create a new wallet </Button>
      </Form.Group>
    </Form>
    <br></br>

    <Form>
      <Form.Group className ="mb-3" controlId ="walletBalance">
      <p><b>Digit the id if you want to see your balance</b></p>
        <Form.Control
                 type="text"
                 placeholder="enter id of the wallet"
                 onChange={(e) => setId(Number(e.target.value))}
        />
        <Button variant = "success"  onClick={() => Balance()} > balance</Button>
      </Form.Group>
    </Form>
    <br></br>
    <Form>
      <Form.Group className ="mb-3" controlId ="walletDeposit">
      <p><b>Digit your id and amount of eth to deposit</b></p>
        <Form.Control
                 type="text"
                 placeholder="enter id of the wallet"
                 onChange={(e) => setId(Number(e.target.value))}
        /><br></br>
        <Form.Control
                 type="text"
                 placeholder="enter amount eth"
                 onChange={(e) => setAmountEth(Number(e.target.value))}
        />
        <Button variant = "success"  onClick={() => DepositEth()} > deposit into your wallet </Button>
      </Form.Group>
    </Form>
    <br></br>
    <Form>
      <Form.Group className ="mb-3" controlId ="walletWithdraw">
      <p><b>Digit your id,address and amount where do you want sand your eth</b></p>
        <Form.Control
                 type="text"
                 placeholder="enter id of the wallet"
                 onChange={(e) => setId(Number(e.target.value))}
        /><br></br>
        <Form.Control
                 type="text"
                 placeholder="enter the address"
                 onChange={(e) => setAddressWithdraw(e.target.value)}
        /> <br></br>
        <Form.Control
                 type="text"
                 placeholder="enter the amount"
                 onChange={(e) => setAmountEth(Number(e.target.value))}
        />
        <Button variant = "success"  onClick={() => WithdrawEth()} >withdraw from your wallet </Button>
      </Form.Group>
    </Form>
    <br></br>
    <Form>
      <Form.Group className ="mb-3" controlId ="StakeYourEth">
      <p><b>Digit your id and amount that you want stake</b></p>
        <Form.Control
                 type="text"
                 placeholder="enter id of the wallet"
                 onChange={(e) => setId(Number(e.target.value)) }
        /><br></br>
        <Form.Control
                 type="text"
                 placeholder="enter amount to stake"
                 onChange={(e) => setAmountEthStake(Number(e.target.value))}
        />
        <Button variant = "success"  onClick={() => Stake()} > Stake </Button>
      </Form.Group>
    </Form>
    

   </div>
   <div style={{ paddingRight: 350 ,paddingTop:130, float: 'right'}}>
    <Form>
      <Form.Group className ="mb-3" controlId ="ControlYourStake">
      <p><b>Digit the id if you want check how much eth you have in stake</b></p>
        <Form.Control
                 type="text"
                 placeholder="enter id of the wallet"
                 onChange={(e) => setId(Number(e.target.value))}
        />
        <Button variant = "success"  onClick={() => ControllStake()} > ControlYourStake </Button>
      </Form.Group>
    </Form>
    <br></br>
    <Form>
      <Form.Group className ="mb-3" controlId ="Currentrewards">
      <p><b>Digit the id if you want check your current rewards</b></p>
        <Form.Control
                 type="text"
                 placeholder="enter id of the wallet"
                 onChange={(e) => setId(Number(e.target.value))}
        />
        <Button variant = "success"  onClick={() => CurrentReward()} >  Currentrewards</Button>
      </Form.Group>
    </Form>
    <br></br>
    <Form>
      <Form.Group className ="mb-3" controlId ="unstakeEth">
      <p><b>Digit the id if you want unstake your eth</b></p>
        <Form.Control
                 type="text"
                 placeholder="enter id of the wallet"
                 onChange={(e) => setId(Number(e.target.value))}
        />
        <Button variant = "success"  onClick={() => Unstake()} > unstakeEth </Button>
      </Form.Group>
    </Form>
    <br></br>
    <Form>
      <Form.Group className ="mb-3" controlId ="isWalletStaked">
      <p><b>Digit the id if you want check if your wallet is staked</b></p>
        <Form.Control
                 type="text"
                 placeholder="enter id of the wallet"
                 onChange={(e) => setId(Number(e.target.value))}
        />
        <Button variant = "success"  onClick={() => checkStaked()} > isWalletStaked </Button>
      </Form.Group>
    </Form>
    <br></br>
    <Form>
      <Form.Group className ="mb-3" controlId ="totalAddressesStaked">
      <p><b>Press de button to se how much address are staked</b></p>
        <Button variant = "success"  onClick={() => TotalStaked()} > totalAddressesStaked </Button>
      </Form.Group>
    </Form>

    </div>
   </>
  );
};

export default App;
