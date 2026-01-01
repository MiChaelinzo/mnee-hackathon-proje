# Understanding MNEE Balance Types

This guide explains the different types of MNEE balances in the marketplace and how to identify them.

## Two Types of MNEE

### 🔗 On-Chain MNEE (Real Currency)
- **What it is**: Real MNEE stablecoin tokens from your connected MetaMask wallet on Ethereum Mainnet
- **Source**: Your actual wallet balance on the blockchain
- **Visual Indicator**: Green accent color with "ON-CHAIN" badge
- **Usage**: Can be used for real purchases that are recorded on the Ethereum blockchain
- **Viewable**: Transaction hashes can be verified on Etherscan
- **Contract Address**: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`

### 🧪 Test MNEE (Demo Currency)
- **What it is**: Simulated tokens for testing and demonstration purposes
- **Source**: Test faucet (accessible via "Test Faucet" button in header)
- **Visual Indicator**: Purple/blue primary color with "TEST" badge and flask icon (🧪)
- **Usage**: For exploring the marketplace features without spending real currency
- **Limitations**: 
  - Has no real monetary value
  - Cannot be withdrawn or converted to real MNEE
  - Not recorded on the blockchain
  - Demo-only transactions
- **Faucet Details**:
  - Available amounts: 100, 500, or 1,000 test MNEE
  - Custom amounts up to 10,000 test MNEE
  - 1-hour cooldown between claims

## Visual Indicators Throughout the App

### Header Display
When your wallet is connected, the header shows your balances separately:

```
🟢 ON-CHAIN    500.00 MNEE  ← Real blockchain balance
🧪 TEST        1000.00 MNEE ← Demo balance from faucet
```

### Wallet Info Card (in Agent Dashboard)
Shows both balances in separate cards with clear visual distinction:
- **On-Chain Balance**: Green gradient background with "ON-CHAIN" badge
- **Test Balance**: Purple gradient background with "TEST" badge and flask icon
- Total balance shown at the top combines both for convenience

### Marketplace Notice
An informational banner at the top of the marketplace explains:
- Both payment methods are accepted
- On-chain MNEE comes from your connected wallet
- Test MNEE comes from the faucet
- Agents use their internal balance for purchases

### Faucet Dialog
- Clearly labeled as "Test MNEE Faucet" with "DEMO" badge
- Purple/blue themed interface matching test MNEE branding
- Prominent disclaimer: "For demo purposes only • Not real currency"
- Information box explaining that test MNEE has no real value

## Agent Balances

AI agents have their own internal balances that are independent of your wallet:
- Agents use their configured balance to make purchases
- Agent balances are shown in the Agent Dashboard
- When an agent makes a purchase, their internal balance is debited
- You can fund agents by setting their initial balance when creating them

## Best Practices

### For Testing
1. Use **test MNEE** from the faucet to explore features without risk
2. Claim test tokens via the "Test Faucet" button
3. Test agent purchases and marketplace features freely

### For Real Transactions
1. Connect your MetaMask wallet
2. Ensure you're on Ethereum Mainnet
3. Have sufficient **on-chain MNEE** in your wallet
4. Transactions will prompt MetaMask for approval
5. View confirmed transactions on Etherscan

## Quick Reference

| Feature | On-Chain MNEE | Test MNEE |
|---------|--------------|-----------|
| **Color** | 🟢 Green (Accent) | 🧪 Purple (Primary) |
| **Badge** | "ON-CHAIN" | "TEST" + Flask Icon |
| **Source** | Wallet on Ethereum | Test Faucet |
| **Real Value** | ✅ Yes | ❌ No |
| **Blockchain** | ✅ Recorded | ❌ Not recorded |
| **Etherscan** | ✅ Verifiable | ❌ Not applicable |
| **Best For** | Real purchases | Testing & demos |

## Need Help?

- **Can't see your balance?** Make sure your wallet is connected and you're on Ethereum Mainnet
- **Want to test features?** Use the test faucet to get demo MNEE without spending real currency
- **Ready for real transactions?** Ensure you have on-chain MNEE in your connected wallet

---

💡 **Tip**: The visual indicators (colors, badges, and icons) make it easy to distinguish between real and test MNEE at a glance throughout the entire application.
