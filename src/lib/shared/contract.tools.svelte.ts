import { testnetWalletAdapter } from '@builders-of-stuff/svelte-sui-wallet-adapter';
import { Transaction } from '@mysten/sui/transactions';

import { PACKAGE_ID } from './contract.constants';

const walletAdapter = testnetWalletAdapter;

/**
 * Create post
 */
export const createPost = async (title: string, body: string) => {
  if (!walletAdapter?.currentAccount?.address) return;

  const tx = new Transaction();

  const [post] = tx.moveCall({
    target: `${PACKAGE_ID}::posts::create_post`,
    arguments: [
      tx.pure.string(title),
      tx.pure.string(body),
      tx.pure.u64(Date.now()),
      tx.pure.u64(Date.now())
    ]
  });

  tx.transferObjects([post], walletAdapter.currentAccount.address);

  try {
    const { bytes, signature } = await walletAdapter.signTransaction(tx as any, {});

    const executedTx = await walletAdapter.executeTransaction({
      bytes,
      signature
    });

    return executedTx;
  } catch (e) {
    console.log(e);
  }
};
