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
const goal = 30;
var milestone_one = 5;
var milestone_two = 10;
var company_address = "0xF9726EDC5EE6A46B0c9986636182Ae71c31b3E2D";



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
    var {XSGD_address} = require('./config/XSGD.json');
var {equityToken} = require('./config/equitytoken.json');
var cf = require("./smart_contracts/crowdfunding.js")(XSGD_address,equityToken);
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
        vname: 'goal',
        type: 'Uint128',
        value: `${goal}`,
      },
      {
        vname: 'milestone_one',
        type: 'Uint128',
        value: `${milestone_one}`,
      },
      {
        vname: 'milestone_two',
        type: 'Uint128',
        value: `${milestone_two}`,
      },
      {
        vname: 'company_address',
        type: 'ByStr20',
        value: `${company_address}`,
      },
    ];

    // Instance of class Contract
    const contract = zilliqa.contracts.new(cf, init);
    console.log(contract);

    // Deploy the contract.
    // Also notice here we have a default function parameter named toDs as mentioned above.
    // A contract can be deployed at either the shard or at the DS. Always set this value to false.
    const [deployTx, deployedFungibleToken] = await contract.deployWithoutConfirm(
      {
        version: VERSION,
        gasPrice: myGasPrice,
        gasLimit: Long.fromNumber(100000),
      },
      33,
      1000,
      false,
    );

    // process confirm
    console.log(`The transaction id is:`, deployTx.id);
    console.log(`Waiting transaction be confirmed`);
    const confirmedTxn = await deployTx.confirm(deployTx.id);
    console.log(`The transaction status is:`);
    console.log(confirmedTxn.receipt);

    // Introspect the state of the underlying transaction
    console.log(`Deployment Transaction ID: ${deployTx.id}`);
    console.log(`Deployment Transaction Receipt:`);
    console.log(deployTx.txParams.receipt);

    // Get the deployed contract address
    console.log('The contract address is:');
    console.log(deployedFungibleToken.address);
    // save address of smart contract to json file
    const saveAddress = {
      crowdfundingAddress: deployedFungibleToken.address,
    }
    const jsonString = JSON.stringify(saveAddress);
    fs.writeFile('./config/crowdfunding.json', jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    });
    //Following line added to fix issue https://github.com/Zilliqa/Zilliqa-JavaScript-Library/issues/168
    // const deployedContract = zilliqa.contracts.at(deployedFungibleToken.address);
  } catch (err) {
    console.log(err);
  }
}

testBlockchain();

