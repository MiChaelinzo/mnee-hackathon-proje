# MNEE AI Agent Marketplace

> **Autonomous Commerce Platform for AI Agents**  
> Built for the MNEE Hackathon: Programmable Money for Agents, Commerce, and Automated Finance

A decentralized marketplace where AI agents can autonomously discover, purchase, and sell services using MNEE stablecoin (USD-backed on Ethereum), demonstrating the future of programmable money for automated finance and agent-to-agent commerce.

## 🌟 Key Features

### 🤖 AI Agent Management
- **Create & Configure Agents**: Set up multiple AI agents with custom names, balances, and spending limits
- **Autonomous Purchasing**: Enable agents to make purchases independently within configured limits
- **Real-time Analytics**: Track agent performance, spending patterns, and purchase history
- **Smart Controls**: Toggle autonomous purchasing on/off, edit configurations, and monitor balance

### 🛒 Service Marketplace
- **Diverse AI Services**: Browse 15+ pre-configured services across 6 categories:
  - Data Analysis
  - Content Generation
  - API Access
  - Compute Resources (GPU tiers)
  - Machine Learning
  - Image Processing
- **Advanced Search & Filtering**: Find services by name, description, or category
- **Service Performance Metrics**: Real-time stats showing sales, revenue, and trending categories
- **One-Click Purchases**: Select an agent and purchase services with MNEE instantly

### 📦 Bundle & Subscription System
- **Pre-Built Bundles**: 5+ curated service bundles with 15-25% savings
- **Custom Bundle Builder**: Create your own service combinations with:
  - Multi-service selection with checkboxes
  - Dynamic discount configuration (5-50%)
  - Custom validity periods
  - Real-time price calculations
  - Live savings preview
- **Subscription Plans**: 5+ recurring plans (monthly/quarterly/yearly) with up to 40% savings
- **Flexible Options**: Choose between one-time bundles or recurring subscriptions

### 🤖💡 AI-Powered Recommendations
- **Personalized Suggestions**: LLM-driven bundle recommendations based on:
  - Agent purchase history
  - Category preferences
  - Price affordability
  - Service complementarity
- **Confidence Scoring**: Each recommendation includes a confidence percentage and detailed reasoning
- **Smart Matching**: Match scores indicate how well bundles align with purchase patterns
- **Auto-Refresh**: Recommendations update after each purchase

### 📊 AI Recommendation Trends
- **Historical Analytics**: Track which bundles AI recommends most frequently over time
- **Time-Based Filtering**: View trends for last 24h, 7 days, 30 days, or all time
- **Multiple Trend Views**:
  - **Most Recommended**: Top bundles by recommendation count
  - **Rising Trends**: Bundles gaining popularity
  - **High Confidence**: Bundles with highest AI confidence scores
- **Trend Indicators**: Visual up/down/stable indicators for each bundle
- **Export Capabilities**: Download trend reports as CSV or PDF

### 📈 Enhanced Analytics
- **Marketplace Overview**: Total services, sales volume, revenue tracking, and top categories
- **Agent Performance**: Combined balances, spending trends, most active agents, and purchase patterns
- **Weekly Comparisons**: See spending trends vs. previous week with percentage changes
- **Quick Stats**: Average transaction size, weekly totals, and transaction counts

### 💰 MNEE Integration
- **USD-Backed Stablecoin**: Contract address `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`
- **Ethereum Mainnet**: Live on-chain transactions
- **Transparent Pricing**: All prices displayed in MNEE (equivalent to USD)
- **Mock Transactions**: Simulated blockchain transactions with tx hashes
- **Balance Management**: Real-time balance tracking and updates

### 🔒 Wallet Connection
- **Secure Integration**: Connect Ethereum wallet to enable agent purchases
- **Status Indicators**: Clear visual feedback on connection status
- **Contract Information**: Display MNEE contract address and network details
- **Easy Disconnect**: One-click wallet disconnection

### 📱 Transaction Explorer
- **Real-Time Feed**: Live view of all marketplace transactions
- **Detailed Information**: Agent name, service/bundle, amount, timestamp, and tx hash
- **Type Filtering**: Distinguish between service, bundle, and subscription purchases
- **Status Tracking**: Monitor transaction completion status
- **Blockchain Links**: Direct links to Etherscan for verification

## 🚀 Innovation Highlights

### Autonomous Agent Commerce
AI agents operate independently within user-defined parameters, making intelligent purchasing decisions based on their needs and budgets - demonstrating true programmable money use cases.

### Intelligent Bundle Recommendations
Advanced LLM integration analyzes purchase patterns to generate personalized recommendations with transparent reasoning and confidence scoring.

### Historical Trend Analysis
Track AI recommendation patterns over time to understand which bundles are most valuable and identify emerging trends in agent behavior.

### Complete Data Export
Export comprehensive reports in CSV or PDF format for stakeholder presentations and external analysis.

### Real-Time Analytics
Every section includes contextual analytics that update in real-time, providing actionable insights for optimizing agent strategies and marketplace offerings.

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: Shadcn v4 (40+ components)
- **Icons**: Phosphor Icons
- **Animations**: Framer Motion
- **State Management**: React Hooks + useKV (persistent storage)
- **AI Integration**: GPT-4o via Spark LLM API
- **Build Tool**: Vite
- **Blockchain**: Ethereum (MNEE ERC-20 stablecoin)

## 💎 Design Philosophy

### Futuristic Tech Aesthetic
- Dark theme with electric blue primary and neon green accents
- Subtle grid patterns suggesting connectivity
- Glowing effects on active elements
- Smooth animations that feel like AI processing

### Typography
- **Headers**: Space Grotesk (geometric, technical)
- **Body**: Inter (clean, readable)
- **Monospace**: JetBrains Mono (prices, addresses, data)

### Color System (OKLCH)
- **Primary**: `oklch(0.6 0.18 245)` - Electric blue for trust and technology
- **Accent**: `oklch(0.85 0.2 140)` - Neon green for success and transactions
- **Background**: `oklch(0.15 0.05 245)` - Deep navy base
- **Muted**: `oklch(0.7 0.02 245)` - Subdued text

## 📊 Use Cases

1. **AI Research Agent**: Automatically purchases data analysis services and compute resources when needed for research projects
2. **Content Creator Bot**: Subscribes to content generation bundle for consistent blog posts, scripts, and voice synthesis
3. **Trading Algorithm**: Uses real-time market data and blockchain monitoring services for autonomous trading
4. **Image Processing Pipeline**: Leverages image enhancement and background removal services on-demand
5. **Enterprise AI Fleet**: Multiple agents with different specializations, managed centrally with spending controls

## 🎯 MNEE Hackathon Alignment

### AI & Agent Payments ✅
- Autonomous agents making real purchasing decisions
- Smart spending limit enforcement
- Transaction history and balance management

### Commerce & Creator Tools ✅
- Full marketplace with service listings
- Bundle creation and management
- Subscription payment handling
- Service provider earnings tracking

### Financial Automation ✅
- Automated transaction processing
- Spending analytics and forecasting
- AI-driven recommendation engine
- Budget optimization through bundles

## 📝 Getting Started

1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Create an Agent**: Navigate to "Agents" tab and click "Add Agent"
3. **Configure Agent**: Set name, initial balance, and spending limit
4. **Browse Services**: Explore the marketplace and service categories
5. **Make a Purchase**: Select a service, choose your agent, and click "Purchase with MNEE"
6. **Try Bundles**: Check out pre-built bundles or create your own custom combination
7. **Get AI Recommendations**: Visit "Bundles" tab to see personalized AI suggestions
8. **Analyze Trends**: View "AI Trends" to see historical recommendation patterns
9. **Export Data**: Download CSV or PDF reports of AI recommendation trends

## 🔮 Future Enhancements

- Real blockchain integration with Web3 wallets
- On-chain smart contracts for service fulfillment
- Decentralized service provider verification
- Agent-to-agent negotiation and automated pricing
- Machine learning models for demand forecasting
- Cross-chain compatibility
- DAO governance for marketplace rules

## 📄 License

MIT License - Built for MNEE Hackathon 2024

---

**Built with ❤️ for the future of autonomous commerce**
