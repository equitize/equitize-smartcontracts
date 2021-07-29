// get address of deployed fungibleToken smart contract 
var {XSGD_address} = require('./config/XSGD.json');
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
// In order to demonstrate we are going to have two retail investor with XSGD tied to their acccounts
const retailInvestor1 = "0xF9726EDC5EE6A46B0c9986636182Ae71c31b3E2D";
const retailInvestor1Amt = 10;
const retailInvestor2 = "0xc5D1335fA8ad5e5963547aA4C4137CbC8F7C6252";
const retailInvestor2Amt = 20;


async function Transfer(retailInvestor,retailInvestorAmt) {
  try {
    const myGasPrice = units.toQa('2000', units.Units.Li); // Gas Price that will be used by all transactions
    const deployedContract = zilliqa.contracts.at(XSGD_address);

    // Create a new timebased message and call setHello
    // Also notice here we have a default function parameter named toDs as mentioned above.
    // For calling a smart contract, any transaction can be processed in the DS but not every transaction can be processed in the shards.
    // For those transactions are involved in chain call, the value of toDs should always be true.
    // If a transaction of contract invocation is sent to a shard and if the shard is not allowed to process it, then the transaction will be dropped.
    console.log('Calling Transfer transition' );
    const callTx = await deployedContract.call(
      'Transfer',
      [
        {
          vname: 'to',
          type: 'ByStr20',
          value: retailInvestor,
        },
        {
          vname: 'amount',
          type: 'Uint128',
          value: `${retailInvestorAmt}`,
        },
      ],
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
  } catch (err) {
    console.log(err);
  }
}

Transfer(retailInvestor1,retailInvestor1Amt);

Transfer(retailInvestor2,retailInvestor2Amt);

