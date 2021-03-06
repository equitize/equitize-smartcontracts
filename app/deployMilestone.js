const fs = require('fs');
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

const address = getAddressFromPrivateKey(privateKey);
const milestoneOneGoal = 2;
const milestoneTwoGoal = 5;
const recipientAddress = "0xF9726EDC5EE6A46B0c9986636182Ae71c31b3E2D";


async function testBlockchain() {
  try {
    // Get Balance
    const balance = await zilliqa.blockchain.getBalance(address);
    // Get Minimum Gas Price from blockchain
    const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice();

    // Account balance (See note 1)
    console.log(`Your account balance is:`);
    console.log(balance.result);
    console.log(`Current Minimum Gas Price: ${minGasPrice.result}`);
    const myGasPrice = units.toQa('2000', units.Units.Li); // Gas Price that will be used by all transactions
    console.log(`My Gas Price ${myGasPrice.toString()}`);
    const isGasSufficient = myGasPrice.gte(new BN(minGasPrice.result)); // Checks if your gas price is less than the minimum gas price
    console.log(`Is the gas price sufficient? ${isGasSufficient}`);

    // Deploy a contract
    console.log(`Deploying a new contract....`);
    var milestone = require("./smart_contracts/milestone.js")
    const init = [
      // this parameter is mandatory for all init arrays
      {
        vname: '_scilla_version',
        type: 'Uint32',
        value: '0',
      },
      {
        vname: 'owner',
        type: 'ByStr20',
        value: `${address}`,
      },
      {
        vname: 'milestone_one',
        type: 'Uint128',
        value: `${milestoneOneGoal}`,
      },
      {
        vname: 'milestone_two',
        type: 'Uint128',
        value: `${milestoneTwoGoal}`,
      },
      {
        vname: 'company_address',
        type: 'ByStr20',
        value: `${recipientAddress}`,
      },
    ];

    // Instance of class Contract
    const contract = zilliqa.contracts.new(milestone, init);

    // Deploy the contract.
    // Also notice here we have a default function parameter named toDs as mentioned above.
    // A contract can be deployed at either the shard or at the DS. Always set this value to false.
    const [deployTx, deployedMilestone] = await contract.deploy(
      {
        version: VERSION,
        amount: new BN(50),
        gasPrice: myGasPrice,
        gasLimit: Long.fromNumber(10000),
      },
      33,
      1000,
      false,
    );

    // Introspect the state of the underlying transaction
    console.log(`Deployment Transaction ID: ${deployTx.id}`);
    console.log(`Deployment Transaction Receipt:`);
    console.log(deployTx.txParams.receipt);

    // Get the deployed contract address
    console.log('The contract address is:');
    console.log(deployedMilestone.address);
    // save address of smart contract to json file
    const saveAddress = {
      milestoneAddress: deployedMilestone.address,
    }
    const jsonString = JSON.stringify(saveAddress);
    fs.writeFile('./config/milestone.json', jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    });

    const deployedContract = zilliqa.contracts.at(deployedMilestone.address);
    console.log('Calling AddFunds transition' );
    const callTx = await deployedContract.call(
      'AddFunds',
      [],
      {
        // amount, gasPrice and gasLimit must be explicitly provided
        version: VERSION,
        amount: new BN(50),
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
    //Following line added to fix issue https://github.com/Zilliqa/Zilliqa-JavaScript-Library/issues/168
    // const deployedContract = zilliqa.contracts.at(deployedFungibleToken.address);
  } catch (err) {
    console.log(err);
  }
}

testBlockchain();

