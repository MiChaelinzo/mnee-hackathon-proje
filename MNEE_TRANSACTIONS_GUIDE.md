# MNEE Real On-Chain Transaction Guide

This guide explains how to use the real MNEE token transfer functionality for completing actual on-chain purchases in the AI Agent Marketplace.

## Overview

The marketplace now supports **real blockchain transactions** using the MNEE stablecoin (ERC-20 token) on Ethereum Mainnet. When you make a purchase, actual MNEE tokens transfer from your wallet to the service provider's address on-chain.

## Prerequisites

### 1. MetaMask Wallet
- Install [MetaMask browser extension](https://metamask.io/download/)
- Create or import an Ethereum wallet
- Secure your seed phrase safely

### 2. Ethereum Mainnet Connection
- Switch MetaMask to **Ethereum Mainnet** (Chain ID: 1)
- The app will prompt you if you're on the wrong network

### 3. MNEE Tokens
- **MNEE Contract Address**: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`
- Acquire MNEE tokens from supported exchanges or liquidity providers
- You can add MNEE to MetaMask using "Import Tokens" with the contract address above

### 4. ETH for Gas Fees
- Keep some ETH in your wallet to pay for transaction gas fees
- Typical transaction costs ~$5-20 depending on network congestion
- The app will warn you if you have insufficient ETH

## How to Make a Purchase

### Step 1: Connect Your Wallet
1. Click the **"Connect Wallet"** button in the header
2. MetaMask will popup - click **"Connect"**
3. Approve the connection request
4. Your address and balances will display in the header

### Step 2: Browse Services
1. Navigate to the **Marketplace** tab
2. Browse available AI services, or use search/filters
3. View service details by clicking on a service card

### Step 3: Initiate Purchase
1. Click **"Buy Now"** on any service
2. Select an AI agent from the dropdown (or use your wallet address)
3. Click **"Purchase with MNEE"**

### Step 4: Confirm Transaction in MetaMask
1. MetaMask popup appears showing:
   - **To**: Service provider address
   - **Amount**: MNEE tokens being transferred
   - **Gas Fee**: ETH cost for transaction
2. Review the details carefully
3. Click **"Confirm"** to proceed (or **"Reject"** to cancel)

### Step 5: Wait for Confirmation
1. Transaction is submitted to Ethereum blockchain
2. App shows "Transaction Submitted" toast notification
3. Wait for blockchain confirmation (typically 15-60 seconds)
4. App shows "Payment Confirmed" when transaction is mined

### Step 6: View Transaction
1. Click **"View on Etherscan"** in the success notification
2. Or navigate to the **Activity** tab to see all transactions
3. Transaction hash links directly to Etherscan for verification

## Transaction States

### Pending
- Transaction submitted to blockchain but not yet confirmed
- Shows yellow/orange indicator
- Typical duration: 15-60 seconds

### Completed
- Transaction confirmed and included in a block
- MNEE tokens successfully transferred
- Shows green indicator with checkmark
- Balances updated automatically

### Failed
- Transaction rejected or reverted on-chain
- Possible reasons:
  - Insufficient MNEE balance
  - Insufficient ETH for gas
  - User rejected transaction in MetaMask
  - Network error
- Shows red indicator
- No tokens transferred, no funds lost (except gas if transaction was submitted)

## Bundle & Subscription Purchases

The same process applies for bundles and subscriptions:

1. Navigate to **Bundles** tab
2. Select **Bundles** or **Subscriptions** sub-tab
3. Click **"Purchase Bundle"** or **"Subscribe Now"**
4. Confirm transaction in MetaMask
5. Real MNEE tokens transfer to provider address

## Understanding Gas Fees

- **Gas fees** are paid in ETH (not MNEE)
- Gas is required for any Ethereum transaction
- Fee varies based on:
  - Network congestion
  - Transaction complexity
  - Gas price selected (fast/normal/slow)
- MetaMask estimates fees automatically
- You can adjust gas price in MetaMask settings

## Security Best Practices

### ✅ DO:
- Verify the **recipient address** matches the expected service provider
- Check the **MNEE amount** is correct before confirming
- Ensure you're on **Ethereum Mainnet** (Chain ID: 1)
- Keep your seed phrase secure and private
- Use a hardware wallet for large amounts

### ❌ DON'T:
- Share your seed phrase with anyone
- Approve transactions you don't understand
- Send MNEE to unknown addresses
- Use the same wallet for testing and mainnet
- Keep all your funds in a hot wallet

## Troubleshooting

### "Insufficient MNEE Balance"
- Check your MNEE balance in wallet
- Acquire more MNEE tokens before purchasing
- Ensure you're checking the correct wallet address

### "Insufficient ETH for Gas"
- Add ETH to your wallet to cover gas fees
- Even with sufficient MNEE, you need ETH for gas

### "Transaction Rejected by User"
- You clicked "Reject" in MetaMask
- No funds lost, try again when ready

### "Wrong Network"
- Switch to Ethereum Mainnet in MetaMask
- Click "Switch Network" button in the app

### "MetaMask Not Detected"
- Install MetaMask browser extension
- Refresh the page after installation
- Ensure MetaMask is enabled for this site

### Transaction Stuck as Pending
- Check Etherscan using the transaction hash
- May need to wait longer during high network congestion
- Can speed up transaction in MetaMask (costs extra gas)
- Can cancel transaction in MetaMask (costs gas)

## Real-Time Balance Updates

- Balances automatically refresh after each transaction
- Manual refresh available via wallet refresh button
- Shows both MNEE and ETH balances
- Balances fetched directly from blockchain

## Transaction History

All transactions are recorded with:
- **Transaction Hash**: Unique identifier on blockchain
- **Timestamp**: When transaction was initiated
- **Amount**: MNEE tokens transferred
- **Status**: Pending/Completed/Failed
- **Service**: What was purchased
- **Agent**: Which agent made the purchase

## Verifying Transactions on Etherscan

1. Copy the transaction hash from the app
2. Visit [Etherscan.io](https://etherscan.io)
3. Paste hash in search bar
4. View full transaction details:
   - Block number
   - Gas used
   - From/To addresses
   - Token transfer details
   - Timestamp

## MNEE Token Information

- **Name**: MNEE
- **Symbol**: MNEE
- **Type**: ERC-20 Standard Token
- **Decimals**: 18
- **Blockchain**: Ethereum Mainnet
- **Contract**: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`
- **Purpose**: USD-backed stablecoin for programmable money and agent commerce

## Support & Resources

- **MNEE Website**: [https://mnee.io](https://mnee.io)
- **Etherscan Contract**: [View on Etherscan](https://etherscan.io/address/0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF)
- **MetaMask Support**: [https://support.metamask.io](https://support.metamask.io)
- **Ethereum Gas Tracker**: [https://etherscan.io/gastracker](https://etherscan.io/gastracker)

## Testing vs Production

**⚠️ IMPORTANT**: This marketplace uses **Ethereum Mainnet** with real MNEE tokens and real value.

- All transactions are irreversible
- Real money is involved
- Test small amounts first
- Ensure recipient addresses are correct
- Double-check all transaction details

For testing purposes:
- Use a separate test wallet with minimal funds
- Start with small purchase amounts
- Verify everything works before larger transactions

---

**Questions or Issues?** Check the troubleshooting section above or consult the MNEE documentation at [mnee.io](https://mnee.io)
