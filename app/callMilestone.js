// get address of deployed fungibleToken smart contract 
var {milestoneAddress} = require('./config/milestone.json');
const { BN, Long, bytes, units } = require('@zilliqa-js/util');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const {
  toBech32Address,
  getAddressFromPrivateKey,
} = require('@zilliqa-js/crypto');

const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');

const chainId = 333; // chainId of the developer testnet
const msgVersion = 1; // current msgVersion
const VERSION = bytes.pack(chainId, msgVersion);

// Populate the wallet with an account
const privateKey =
  '9ec14378e6b6058e21497917df8632d6afde2d0ffced3305c8e7d6411dd00ef7';


zilliqa.wallet.addByPrivateKey(privateKey);
const sendFT = 20;
const recipientAddress = "0xF9726EDC5EE6A46B0c9986636182Ae71c31b3E2D";


async function testBlockchain() {
  try {
    const myGasPrice = units.toQa('2000', units.Units.Li); // Gas Price that will be used by all transactions
    console.log(milestoneAddress);
    const deployedContract = zilliqa.contracts.at(milestoneAddress);

    // Create a new timebased message and call setHello
    // Also notice here we have a default function parameter named toDs as mentioned above.
    // For calling a smart contract, any transaction can be processed in the DS but not every transaction can be processed in the shards.
    // For those transactions are involved in chain call, the value of toDs should always be true.
    // If a transaction of contract invocation is sent to a shard and if the shard is not allowed to process it, then the transaction will be dropped.
    console.log('Calling FinishMilestoneOne transition' );
    const callTx = await deployedContract.call(
      'FinishMilestoneOne',
      [],
      {
        // amount, gasPrice and gasLimit must be explicitly provided
        version: VERSION,
        amount: new BN(0),
        gasPrice: myGasPrice,
        gasLimit: Long.fromNumber(8000),
      },
      33,
      1000,
      false,
    );

    // Retrieving the transaction receipt (See note 2)
    console.log(JSON.stringify(callTx.receipt, null, 4));

    //Get the contract state
    console.log('Getting contract state...');
    const state = await deployedContract.getState();
    console.log('The state of the contract is:');
    console.log(JSON.stringify(state, null, 4));

    //milestone2
    console.log('Calling FinishMilestoneTwo transition' );
    const callTx2 = await deployedContract.call(
      'FinishMilestoneTwo',
      [],
      {
        // amount, gasPrice and gasLimit must be explicitly provided
        version: VERSION,
        amount: new BN(0),
        gasPrice: myGasPrice,
        gasLimit: Long.fromNumber(8000),
      },
      33,
      1000,
      false,
    );

    // Retrieving the transaction receipt (See note 2)
    console.log(JSON.stringify(callTx2.receipt, null, 4));

    //Get the contract state
    console.log('Getting contract state...');
    const state = await deployedContract.getState();
    console.log('The state of the contract is:');
    console.log(JSON.stringify(state, null, 4));

     //milestone3
     console.log('Calling FinishMilestoneThree transition' );
     const callTx3 = await deployedContract.call(
       'FinishMilestoneThree',
       [],
       {
         // amount, gasPrice and gasLimit must be explicitly provided
         version: VERSION,
         amount: new BN(0),
         gasPrice: myGasPrice,
         gasLimit: Long.fromNumber(8000),
       },
       33,
       1000,
       false,
     );
 
     // Retrieving the transaction receipt (See note 2)
     console.log(JSON.stringify(callTx3.receipt, null, 4));
 
     //Get the contract state
     console.log('Getting contract state...');
     const state = await deployedContract.getState();
     console.log('The state of the contract is:');
     console.log(JSON.stringify(state, null, 4));

     //SetDeadlineTrue
     console.log('Calling SetDeadlineTrue transition' );
     const callTx5 = await deployedContract.call(
       'SetDeadlineTrue',
       [],
       {
         // amount, gasPrice and gasLimit must be explicitly provided
         version: VERSION,
         amount: new BN(0),
         gasPrice: myGasPrice,
         gasLimit: Long.fromNumber(8000),
       },
       33,
       1000,
       false,
     );
 
     // Retrieving the transaction receipt (See note 2)
     console.log(JSON.stringify(callTx5.receipt, null, 4));
 
     //Get the contract state
     console.log('Getting contract state...');
     const state = await deployedContract.getState();
     console.log('The state of the contract is:');
     console.log(JSON.stringify(state, null, 4));

    

     //claimback
     console.log('Calling Claimback transition' );
     const callTx4 = await deployedContract.call(
       'Claimback',
       [],
       {
         // amount, gasPrice and gasLimit must be explicitly provided
         version: VERSION,
         amount: new BN(0),
         gasPrice: myGasPrice,
         gasLimit: Long.fromNumber(8000),
       },
       33,
       1000,
       false,
     );
 
     // Retrieving the transaction receipt (See note 2)
     console.log(JSON.stringify(callTx4.receipt, null, 4));
 
     //Get the contract state
     console.log('Getting contract state...');
     const state = await deployedContract.getState();
     console.log('The state of the contract is:');
     console.log(JSON.stringify(state, null, 4));
     
  } catch (err) {
    console.log(err);
  }
}

testBlockchain();

