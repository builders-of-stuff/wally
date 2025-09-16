<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { page } from '$app/state';
  import {
    ConnectButton,
    testnetWalletAdapter as walletAdapter
  } from '@builders-of-stuff/svelte-sui-wallet-adapter';
</script>

<nav class="border-b border-border bg-card">
  <div class="mx-auto max-w-6xl px-4 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-8">
        <a
          href="/"
          class="text-xl font-bold text-card-foreground transition-colors hover:text-primary"
        >
          Wally Blog
        </a>

        <div class="hidden space-x-6 md:flex">
          <a
            href="/"
            class="text-muted-foreground transition-colors hover:text-card-foreground"
            class:text-card-foreground={page.route.id === '/'}
          >
            Home
          </a>
          <a
            href="/profile"
            class="text-muted-foreground transition-colors hover:text-card-foreground"
            class:text-card-foreground={page.route.id === '/profile'}
          >
            Profile
          </a>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <ConnectButton {walletAdapter} />
        <Button href="/create" size="sm">Create Post</Button>
      </div>
    </div>
  </div>
</nav>
