# Web3 Wallet Integration Guide

## Overview
The MNEE Marketplace now features full MetaMask integration for real Ethereum wallet connectivity and MNEE stablecoin interactions.

## Features

### Real Wallet Connection
- Connect your MetaMask wallet directly to the application
- Automatic detection of MetaMask browser extension
- Persistent connection across page reloads
- Automatic disconnection handling

### Live Balance Tracking
- Real-time MNEE token balance display
- ETH balance monitoring
- Automatic balance updates after transactions
- Manual refresh capability

### Network Management
- Automatic Ethereum Mainnet verification
- Visual indicators for wrong network
- One-click network switching
- Chain ID validation

### Transaction Support
- MNEE token transfer functionality
- Transaction status monitoring
- Etherscan integration for transaction verification
- Proper error handling and user feedback

## How to Use

### 1. Install MetaMask
If you don't have MetaMask installed:
1. Visit https://metamask.io/download/
2. Install the browser extension for Chrome, Firefox, or Brave
3. Create a new wallet or import an existing one
4. Secure your wallet with a strong password

### 2. Connect Your Wallet
1. Click the "Connect Wallet" button in the header
2. MetaMask will prompt you to select an account
3. Approve the connection request
4. Your wallet address will appear in the header

### 3. Verify Network
The application requires Ethereum Mainnet (Chain ID: 1)
- If connected to the wrong network, a warning will appear
- Click "Switch to Mainnet" to automatically switch networks
- MetaMask will request your approval for the network change

### 4. View Balances
Once connected:
- MNEE balance is displayed in the header and wallet card
- ETH balance is shown in the network status bar
- Balances update automatically after transactions

### 5. Make Transactions
To purchase services:
1. Ensure you have sufficient MNEE balance
2. Select a service in the marketplace
3. Choose an agent to make the purchase
4. Confirm the transaction
5. Approve in MetaMask when prompted

## MNEE Token Contract
- **Address**: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`
- **Network**: Ethereum Mainnet
- **Type**: ERC-20 USD-backed stablecoin

## Troubleshooting

### MetaMask Not Detected
- **Issue**: Application says MetaMask is not detected
- **Solution**: Install MetaMask browser extension and refresh the page

### Connection Failed
- **Issue**: Wallet connection request fails
- **Solution**: Check that MetaMask is unlocked and try again

### Wrong Network
- **Issue**: Warning appears about wrong network
- **Solution**: Click "Switch to Mainnet" or manually change network in MetaMask

### Balance Not Updating
- **Issue**: Balance doesn't reflect recent transactions
- **Solution**: Balances update automatically, but you can refresh the page if needed

### Transaction Rejected
- **Issue**: Transaction fails or is rejected
- **Solution**: This happens when you reject the MetaMask prompt or have insufficient gas

## Security Notes

### Best Practices
- Never share your seed phrase or private keys
- Always verify transaction details in MetaMask before confirming
- Only connect to trusted applications
- Keep MetaMask updated to the latest version
- Use hardware wallets for large amounts

### What the App Can Do
- Read your wallet address
- Read your MNEE and ETH balances
- Request transaction signatures (requires your approval)

### What the App Cannot Do
- Access your private keys
- Make transactions without your explicit approval
- Change your wallet settings
- Access other tokens without your permission

## Technical Details

### Supported Wallets
- MetaMask (primary)
- Any wallet that implements the EIP-1193 provider standard

### Contract Interactions
The application uses the following MNEE contract functions:
- `balanceOf(address)` - Check token balance
- `transfer(address, uint256)` - Transfer tokens
- `approve(address, uint256)` - Approve spending
- `allowance(address, address)` - Check allowance

### Events Handled
- `accountsChanged` - Wallet account switches
- `chainChanged` - Network switches
- Connection/disconnection events

## Development

### useWallet Hook
The `useWallet` hook provides all wallet functionality:

```typescript
const {
  address,           // Current wallet address
  chainId,          // Current chain ID
  isConnected,      // Connection status
  isConnecting,     // Loading state
  mneeBalance,      // MNEE token balance
  ethBalance,       // ETH balance
  connectWallet,    // Connect function
  disconnectWallet, // Disconnect function
  switchToEthereumMainnet, // Network switch
  transferMNEE,     // Transfer function
  refreshBalances,  // Manual refresh
} = useWallet()
```

### Adding to Components
Import and use the hook in any component:

```typescript
import { useWallet } from '@/hooks/use-wallet'

function MyComponent() {
  const wallet = useWallet()
  
  return (
    <div>
      {wallet.isConnected && (
        <p>Connected: {wallet.address}</p>
      )}
    </div>
  )
}
```

## Future Enhancements
- Multi-wallet support (WalletConnect, Coinbase Wallet)
- Transaction history from blockchain
- Gas estimation and optimization
- Token swapping integration
- ENS name resolution
