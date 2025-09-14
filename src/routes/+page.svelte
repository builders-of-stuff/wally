<script lang="ts">
  import {
    ConnectButton,
    devnetWalletAdapter as walletAdapter
  } from '@builders-of-stuff/svelte-sui-wallet-adapter';
</script>

<div class="">
  <ConnectButton {walletAdapter} />
</div>

<h1 class=" ">Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation
</p>
