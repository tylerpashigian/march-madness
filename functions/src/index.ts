import * as functions from 'firebase-functions';

import { POSClient, use } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-ethers';
import { providers, Wallet } from 'ethers';
import { config } from './config';

// install ethers plugin
use(Web3ClientPlugin);

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const heartbeat = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

export const getBalance = functions.https.onRequest(
  async (request, response) => {
    const privateKey = config.user1.privateKey ?? '';
    const userAddress = config.user1.address ?? '';

    const parentProvider = new providers.JsonRpcProvider(config.parent.rpc);
    const childProvider = new providers.JsonRpcProvider(config.child.rpc);

    const posClient = new POSClient();
    await posClient.init({
      network: 'testnet',
      version: 'mumbai',
      parent: {
        provider: new Wallet(privateKey, parentProvider),
        defaultConfig: {
          from: userAddress,
        },
      },
      child: {
        provider: new Wallet(privateKey, childProvider),
        defaultConfig: {
          from: userAddress,
        },
      },
    });

    const erc20Token = posClient.erc20(config.pos.child.erc20, false);
    const result = await erc20Token.getBalance(userAddress);

    response.send({
      result,
    });
  }
);
