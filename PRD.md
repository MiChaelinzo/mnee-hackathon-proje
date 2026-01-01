# AI Agent Marketplace - Autonomous Commerce Platform

A decentralized marketplace where AI agents can autonomously discover, purchase, and sell services using MNEE stablecoin, demonstrating the future of programmable money for automated finance and agent-to-agent commerce.

**Experience Qualities**: 
1. **Futuristic** - The interface should feel like a glimpse into tomorrow's autonomous economy, where AI agents transact seamlessly
2. **Trustworthy** - Every transaction is transparent and verifiable on-chain, building confidence in automated commerce
3. **Intelligent** - The platform learns from agent behaviors and optimizes service discovery through smart matching

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
- This is a full-featured marketplace with service listings, autonomous agent interactions, on-chain transactions via MNEE stablecoin, transaction history, and intelligent service matching. It requires multiple views, wallet integration, smart contract interaction, and sophisticated state management.

## Essential Features

### Service Marketplace
- **Functionality**: Display a grid of AI services that agents can purchase (data analysis, content generation, API access, compute resources, etc.)
- **Purpose**: Create a discoverable catalog of services available for autonomous purchase
- **Trigger**: User lands on the marketplace or agent queries available services
- **Progression**: View services grid → Filter by category/price → Click service card → View details modal → Purchase with MNEE
- **Success criteria**: Services display correctly with pricing, description, provider info, and purchase options

### Agent Dashboard
- **Functionality**: Shows the user's registered AI agents, their MNEE balances, transaction history, and service usage
- **Purpose**: Manage multiple AI agents and monitor their autonomous spending
- **Trigger**: Click "My Agents" navigation
- **Progression**: View agent list → Select agent → View balance & history → Configure spending limits → Enable/disable autonomous purchasing
- **Success criteria**: Real-time balance updates, transaction history syncs with blockchain, spending limits enforce correctly

### Autonomous Purchase Flow
- **Functionality**: AI agents can autonomously purchase services using MNEE with real on-chain transactions
- **Purpose**: Demonstrate programmable money enabling agent autonomy with actual blockchain settlement
- **Trigger**: Agent identifies a need (simulated) or user initiates test purchase
- **Progression**: Agent evaluates need → Queries available services → Checks MNEE balance → User approves MetaMask transaction → MNEE transfers on-chain from user to service provider → Transaction confirmed on Ethereum → Service access granted
- **Success criteria**: Transaction completes on Ethereum mainnet, MNEE transfers from user wallet to service provider address, transaction hash is recorded and viewable on Etherscan, balances update in real-time

### Service Provider Portal
- **Functionality**: Users can list their own AI services for sale, set pricing in MNEE, and track earnings
- **Purpose**: Enable a two-sided marketplace where anyone can become a service provider
- **Trigger**: Click "List Service" button
- **Progression**: Fill service form → Set MNEE price → Add description/category → Submit → Service appears in marketplace
- **Success criteria**: New services are instantly available, providers receive MNEE payments automatically

### Transaction Explorer
- **Functionality**: Real-time feed of all marketplace transactions with blockchain verification
- **Purpose**: Provide transparency and showcase the programmable money in action
- **Trigger**: Navigate to "Transactions" tab or view from dashboard
- **Progression**: View transaction feed → Click transaction → See blockchain details → Verify on Etherscan
- **Success criteria**: All transactions are logged, linked to Etherscan, and update in real-time

### Smart Agent Recommendations
- **Functionality**: AI-powered suggestions for services based on agent behavior and needs
- **Purpose**: Optimize service discovery and demonstrate intelligent automation
- **Trigger**: Agent views marketplace or completes a transaction
- **Progression**: System analyzes agent history → Generates recommendations → Displays relevant services → Agent can quick-purchase
- **Success criteria**: Recommendations are contextually relevant and lead to higher purchase rates

### Service Bundles
- **Functionality**: Pre-packaged combinations of related services at discounted rates
- **Purpose**: Encourage bulk purchases and provide cost savings for common service combinations
- **Trigger**: User navigates to Bundles tab
- **Progression**: Browse bundles → View included services and savings → Select bundle → Choose agent → Purchase with MNEE
- **Success criteria**: Bundles display original vs. bundle pricing with clear discount percentage, successful purchases with bundle tracking

### Custom Bundle Builder
- **Functionality**: Interactive tool allowing users to create custom service bundles with dynamic pricing and discount configuration
- **Purpose**: Enable personalized service combinations tailored to specific agent needs while maximizing cost savings
- **Trigger**: Click "Create Custom Bundle" button in Bundles view
- **Progression**: Opens builder modal → Search/filter services → Select 2+ services → Configure bundle name/description → Adjust discount slider (5-50%) → Set validity period → View real-time pricing → Create bundle
- **Success criteria**: Users can select multiple services, see live price calculations with savings, apply suggested discounts based on bundle size, and successfully create custom bundles that appear in their bundles list

### Subscription Packages
- **Functionality**: Recurring payment plans (monthly/quarterly/yearly) for ongoing service access with progressive discounts
- **Purpose**: Create predictable revenue streams and reward commitment with significant savings
- **Trigger**: User navigates to Subscriptions tab within Bundles
- **Progression**: Browse subscription tiers → Compare pricing and features → Select plan → Choose agent → Subscribe with MNEE
- **Success criteria**: Clear billing period display, automatic renewal tracking, subscription status management

### AI-Powered Bundle Recommendations
- **Functionality**: Intelligent LLM-driven analysis of agent purchase history to generate personalized bundle recommendations with confidence scores and reasoning
- **Purpose**: Increase bundle adoption by providing data-driven suggestions tailored to each agent's unique purchasing patterns and needs
- **Trigger**: Agent is selected in Bundles view, automatically generates on load or when "Refresh" is clicked
- **Progression**: System analyzes purchase history → LLM evaluates patterns & available bundles → Generates top 3 recommendations with confidence scores → Displays personalized cards with reasoning → User can purchase directly
- **Success criteria**: Recommendations reflect actual purchase patterns, reasoning is clear and specific, confidence scores are accurate, purchasing is seamless from recommendation cards

### AI Recommendation Trend Analysis
- **Functionality**: Historical analytics showing which bundles and subscriptions the AI recommends most frequently over time, with trend indicators and confidence metrics
- **Purpose**: Provide data-driven insights into AI recommendation patterns, helping users understand which bundles are most consistently recommended and why
- **Trigger**: Navigate to "AI Trends" tab within Bundles view
- **Progression**: View trends dashboard → Select time range (24h/7d/30d/all) → Browse "Most Recommended" / "Rising Trends" / "High Confidence" tabs → See ranking with metrics → Identify patterns
- **Success criteria**: Tracks all AI recommendations in persistent storage, displays accurate frequency counts, calculates trend directions (up/down/stable), shows average confidence scores, and provides time-based filtering with clear visualizations

### Trend Report Export
- **Functionality**: Export comprehensive AI recommendation trend reports in CSV or PDF formats for offline analysis and reporting
- **Purpose**: Enable data portability, facilitate stakeholder reporting, and support external analysis of recommendation patterns
- **Trigger**: Click "Export CSV" or "Export PDF" buttons in the AI Recommendation Trends section
- **Progression**: Select desired time range → Click export button → CSV downloads immediately or PDF opens in print dialog → Save/share report
- **Success criteria**: CSV exports contain all trend metrics in tabular format, PDF reports include formatted tables with branding and summary statistics, both respect selected time range filter, exports complete successfully with user feedback via toast notifications

### Enhanced Analytics Dashboard
- **Functionality**: Comprehensive statistics and insights across marketplace activity, agent performance, and service metrics with visual indicators and trend analysis
- **Purpose**: Provide users with actionable insights into marketplace performance, spending patterns, and agent behavior to optimize their strategies
- **Trigger**: Viewing any major section (Marketplace, Agents, Bundles) automatically displays relevant analytics
- **Progression**: View section → See real-time stats → Identify trends → Make data-driven decisions
- **Success criteria**: Stats update in real-time, trend indicators show directional changes accurately, analytics are contextual to current view, performance metrics are meaningful and actionable

### Wallet Connection Enhancement
- **Functionality**: Real MetaMask wallet integration with actual blockchain connectivity, balance fetching, network verification, and MNEE token transfer capability
- **Purpose**: Enable genuine Web3 transactions using the MNEE stablecoin contract (0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF) on Ethereum Mainnet
- **Trigger**: App load without wallet connection or clicking wallet button
- **Progression**: Detect MetaMask → Click connect → User approves in MetaMask → Fetch real MNEE and ETH balances from blockchain → Verify network → Display connection status → Enable purchase transactions
- **Success criteria**: Real wallet addresses displayed, actual MNEE and ETH balances shown from blockchain queries, network switching functionality works, proper error handling for rejected connections, real ERC-20 token transfers execute successfully with gas estimation and confirmation

### Real MNEE Token Transfers
- **Functionality**: Actual ERC-20 token transfers using the MNEE contract on Ethereum Mainnet with MetaMask transaction signing
- **Purpose**: Enable real programmable money transactions instead of simulated payments, demonstrating true blockchain-based commerce
- **Trigger**: User initiates any purchase (service, bundle, or subscription) while wallet is connected
- **Progression**: Select service/bundle → Choose agent → Click purchase → MetaMask popup appears → User reviews transaction details and gas → User confirms → Transaction submitted to Ethereum → Wait for blockchain confirmation → Balance updates → Transaction recorded with real tx hash
- **Success criteria**: MNEE tokens transfer on-chain from user wallet to provider address, transaction appears on Etherscan with valid hash, gas fees are paid from user's ETH balance, proper error handling for insufficient balance or rejected transactions, real-time balance updates after confirmation, transaction status tracking (pending/completed/failed)

### Test MNEE Token Faucet
- **Functionality**: Demo faucet allowing users to claim test MNEE tokens with configurable amounts and cooldown periods for demonstration purposes
- **Purpose**: Enable testing and demonstration of the marketplace without requiring real MNEE tokens, lowering barrier to entry for demos
- **Trigger**: Click "Test Faucet" button in header after connecting wallet
- **Progression**: Connect wallet → Click faucet button → Modal opens → Select preset amount (100/500/1000) or enter custom amount → Review claim stats → Click claim → Processing animation → Test MNEE added to balance → Success notification
- **Success criteria**: Test tokens are tracked separately and added to displayed balance, 1-hour cooldown enforced per wallet address, claiming is limited to 10,000 MNEE max per request, user sees their total claims and claim count, cooldown timer displays time remaining, test tokens persist across sessions

### Visual Balance Type Indicators
- **Functionality**: Clear visual distinction between real on-chain MNEE and test demo MNEE throughout the entire application using color-coding, badges, and icons
- **Purpose**: Prevent confusion between real and test funds, ensure users understand which balance type they're using, maintain transparency about currency types
- **Trigger**: Wallet connection displays both balance types automatically across all views
- **Progression**: Connect wallet → See real MNEE with green "ON-CHAIN" badge → Claim test MNEE → See test balance with purple "TEST" badge and flask icon → Navigate app → Visual indicators persist in header, cards, and dialogs
- **Success criteria**: Real MNEE displays with green/accent color and "ON-CHAIN" badge, test MNEE displays with purple/primary color and "TEST" badge plus flask icon (🧪), both balances shown separately in header and wallet info card, informational alerts explain the difference in marketplace view, faucet dialog clearly labeled as demo-only with prominent disclaimers, total balance calculations combine both types but maintain visual separation, consistent color scheme throughout (green = real, purple = test)

### Wallet Balance History Chart
- **Functionality**: Interactive time-series visualization showing on-chain MNEE and test MNEE balances over time with multiple chart types (area/line) and time range filters
- **Purpose**: Enable users to track balance changes, understand spending patterns, and visualize the breakdown between real and test funds historically
- **Trigger**: Navigate to "Wallet" tab in main navigation
- **Progression**: View wallet tab → See current balance breakdown stats → Choose time range (24h/7d/30d/all) → Switch between area/line charts → Analyze balance trends → Review data point snapshots
- **Success criteria**: Balance snapshots automatically recorded every 5 minutes and on significant changes, historical data persists across sessions, charts display on-chain vs test MNEE breakdown with distinct colors, time range filters work correctly, tooltips show exact values on hover, stats cards display current totals and percentages, empty state shows when no history exists, responsive design adapts to mobile screens

### Service Performance Metrics
- **Functionality**: Real-time tracking of service sales, revenue, category distribution, and growth trends
- **Purpose**: Help service providers understand market dynamics and optimize their offerings
- **Trigger**: Viewing marketplace tab
- **Progression**: Stats display automatically → See top categories → Identify popular services → Track weekly growth
- **Success criteria**: Accurate sales counting, revenue calculations include all transactions, category breakdown is current, trends show week-over-week comparisons

### Agent Performance Analytics
- **Functionality**: Detailed agent-level analytics including spending patterns, purchase frequency, active status tracking, and comparative performance metrics
- **Purpose**: Enable users to understand which agents are most effective and optimize their agent configurations
- **Trigger**: Viewing agents tab
- **Progression**: View agent dashboard → See aggregated stats → Identify top performer → Review individual agent metrics → Adjust configurations
- **Success criteria**: Analytics update after each transaction, most active agent highlighted, spending trends calculated accurately, balance tracking is precise

### Service Reviews & Ratings
- **Functionality**: Comprehensive review system allowing agents to rate and review services after purchase with helpful voting
- **Purpose**: Build trust through user-generated feedback, help buyers make informed decisions, provide accountability for service quality
- **Trigger**: Agent completes a purchase and user navigates to service reviews tab
- **Progression**: View service details → Navigate to reviews tab → See rating distribution and reviews → Write review (if purchased) → Rate 1-5 stars → Submit review → Other users can mark reviews as helpful
- **Success criteria**: Only agents who purchased can review, reviews display with agent name and timestamp, helpful votes increment properly, average rating calculates correctly across all reviews, rating distribution chart updates in real-time

### Advanced Search & Filtering
- **Functionality**: Multi-faceted search and filter system with category selection, price range sliders, minimum rating filters, availability toggles, and multiple sort options
- **Purpose**: Enable users to quickly find relevant services among hundreds of listings, improving discovery and user experience
- **Trigger**: User accesses marketplace with search bar and filter buttons visible
- **Progression**: Enter search query → Apply category filters → Adjust price range → Set minimum rating → Toggle availability → Choose sort method → View filtered results → Clear individual filters or reset all
- **Success criteria**: Search matches name/description/provider, category badges are toggleable, price slider updates results dynamically, rating filter works correctly, sort options properly reorder results, active filter count displays accurately, filtered result count shows prominently

### Provider Dashboard & Analytics
- **Functionality**: Comprehensive analytics dashboard showing top providers by revenue, service performance metrics, category breakdowns, and ranking system
- **Purpose**: Provide marketplace-wide insights into provider performance, highlight top earners, and show category trends to inform business decisions
- **Trigger**: Navigate to "Providers" tab in main navigation
- **Progression**: View provider dashboard → See marketplace totals → Browse top 5 providers ranked by revenue → View individual provider metrics (revenue, sales, services, rating, top service) → Switch to category performance tab → Analyze revenue distribution by category → Identify growth opportunities
- **Success criteria**: Revenue calculations accurate across all transactions, top providers ranked correctly, provider metrics update in real-time, category breakdown shows percentage of total revenue, provider addresses display properly, top service identified correctly per provider

### Agent Reputation System
- **Functionality**: Trust scoring system that calculates agent reputation based on purchase history, spending amounts, reviews given, account age, and activity, with achievement badges for milestones
- **Purpose**: Build credibility within the marketplace, reward active and trustworthy agents, provide social proof for decision-making
- **Trigger**: Viewing agent details in agent dashboard
- **Progression**: Select agent → View reputation card → See trust score (0-100) with visual progress bar → Review metrics breakdown (purchases, spent, reviews, account age) → View earned achievement badges with descriptions
- **Success criteria**: Trust score calculated from multiple factors (purchases, spending, reviews, activity, age), score updates after each transaction or review, achievement badges unlock at appropriate milestones (Early Adopter, Big Spender 1000+ MNEE, Frequent Buyer 50+, Helpful Reviewer 10+, Verified Agent, Trusted Trader 80+ score), trust level displays (Excellent 80+, Good 60+, Fair 40+, Building <40), visual indicators color-coded appropriately

### Marketplace Chat System
- **Functionality**: Real-time messaging system enabling direct communication between AI agents and service providers with conversation management, topic categorization, price negotiation tools, and status tracking
- **Purpose**: Facilitate direct communication for inquiries, technical support, custom service requests, and price negotiations, creating a more interactive and trustworthy marketplace
- **Trigger**: Click "Chat" tab in main navigation or initiate chat from service/provider details
- **Progression**: Start new conversation → Select recipient type (agent/provider) → Choose specific participant → Select related service (optional) → Pick conversation topic → Send initial message → Exchange messages in real-time → Negotiate prices with offer system → Accept/reject/counter offers → Mark conversation as resolved or archive → Search/filter conversations by status and content
- **Success criteria**: Messages persist across sessions, conversations organized by topics (General Inquiry, Technical Support, Pricing Negotiation, Custom Service, Issue Resolution, Feedback), price offers include service details with original vs offered pricing and custom terms, offer status tracked (pending/accepted/rejected/expired with 7-day expiration), conversation filtering by status (active/resolved/archived), search functionality across participant names and message content, clear visual distinction between sent/received messages, system messages for offer actions, conversation metadata (last message, timestamp, unread count), mobile-responsive chat interface

## Edge Case Handling
- **Insufficient Balance**: Display clear error message with "Add MNEE" button when agent lacks funds
- **Network Failures**: Show retry options and cache pending transactions for when connection restores
- **Failed Transactions**: Automatically refund and log with explanation, notify agent owner
- **Duplicate Purchases**: Prevent agents from buying the same service multiple times in short succession
- **Service Unavailable**: Gray out unavailable services and offer alternatives
- **Wallet Not Connected**: Show prominent "Connect Wallet" state with instructions

## Design Direction
The design should evoke a sense of the future - sleek, tech-forward, and intelligent. Think cyberpunk meets fintech: dark backgrounds with vibrant accent colors, subtle grid patterns suggesting connectivity, and smooth animations that feel like AI processing. The interface should feel both powerful and approachable, balancing technical sophistication with ease of use.

## Color Selection
A dark, tech-forward palette with electric accents that suggest digital currency and AI intelligence.

- **Primary Color**: Electric Blue (oklch(0.6 0.18 245)) - Communicates technology, trust, and digital innovation; used for CTAs and agent status indicators
- **Secondary Colors**: 
  - Deep Navy (oklch(0.15 0.05 245)) - Base background, creates depth
  - Cyan Accent (oklch(0.75 0.15 200)) - Service highlights, success states
  - Purple Accent (oklch(0.65 0.2 290)) - Premium features, AI elements
- **Accent Color**: Neon Green (oklch(0.85 0.2 140)) - Transaction success, active states, "Buy Now" buttons
- **Foreground/Background Pairings**:
  - Primary Blue on Deep Navy: White text (#FFFFFF) - Ratio 8.2:1 ✓
  - Accent Green on Deep Navy: White text (#FFFFFF) - Ratio 12.5:1 ✓
  - Cyan on Deep Navy: Deep Navy text (oklch(0.15 0.05 245)) - Ratio 7.8:1 ✓
  - Muted text on Deep Navy: Light Gray (oklch(0.7 0 0)) - Ratio 6.1:1 ✓

## Font Selection
Typography should feel technical yet approachable - monospace for data/transactions, geometric sans for interface elements.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Space Grotesk Bold / 36px / -0.02em letter spacing
  - H2 (Section Heads): Space Grotesk Semibold / 24px / -0.01em letter spacing
  - H3 (Card Titles): Space Grotesk Medium / 18px / normal letter spacing
  - Body Text: Inter Regular / 16px / 0.01em letter spacing / 1.6 line height
  - Monospace (Prices/Addresses): JetBrains Mono Regular / 14px / normal letter spacing
  - Small Labels: Inter Medium / 12px / 0.02em letter spacing / uppercase

## Animations
Animations should feel intelligent and purposeful - like systems processing information. Use subtle glows for active elements, smooth slide transitions between views, and pulsing indicators for real-time activity. Loading states should show data "streaming in" rather than generic spinners. Transaction confirmations should celebrate success with a brief satisfying glow effect. Keep most animations under 300ms for responsiveness, but allow transaction success moments to feel more celebratory (500ms).

## Component Selection
- **Components**: 
  - Card with hover states for service listings
  - Dialog for service details, purchase confirmation, and bundle builder modal
  - Table for transaction history with sortable columns
  - Badge for service categories and agent status
  - Button with multiple variants (primary for purchases, secondary for navigation, destructive for cancellation)
  - Tabs for switching between marketplace/agents/transactions views
  - Input and Select for service filtering and bundle configuration
  - Textarea for bundle descriptions
  - Checkbox for multi-service selection in bundle builder
  - Slider for discount percentage and validity period configuration
  - Avatar for agent and provider profiles
  - Progress for loading states and transaction processing
  - Tooltip for explaining blockchain concepts
  - Alert for transaction confirmations and errors
  - Separator for visual organization in pricing breakdowns
- **Customizations**: 
  - Custom gradient card backgrounds with subtle grid patterns using CSS
  - Animated transaction feed with slide-in effects using framer-motion
  - Custom MNEE balance display with currency formatting
  - Glowing border effects on active/hover states using box-shadow
  - Custom agent status indicators (active/inactive/processing) with pulsing animations
- **States**: 
  - Buttons: default (solid), hover (brightens + lifts), active (pressed), disabled (dimmed + no interaction), loading (spinner + disabled)
  - Cards: default (subtle border), hover (border brightens + subtle lift + glow), selected (bright border + maintained elevation)
  - Inputs: default (border), focus (primary border + ring), error (destructive border + shake), success (green border + check)
- **Icon Selection**: 
  - Robot (ai/agent representations)
  - ShoppingCart (purchases/marketplace)
  - Wallet (MNEE balance)
  - ArrowsClockwise (transactions/refresh)
  - Lightning (quick actions/autonomous)
  - Tag (service categories)
  - ChartLine (analytics/trends/historical data/wallet balance history)
  - Check/X (success/failure states)
  - MagnifyingGlass (search/filter)
  - Plus (add service/create bundle)
  - Package (bundles/grouped services)
  - Wrench (builder tools/customization)
  - Calendar (validity periods/subscriptions)
  - Percent (discounts/savings)
  - TrendUp (recommendations/growth/rising trends)
  - Sparkle (premium/special features)
  - Warning (validation/alerts)
  - Fire (hot/trending/high activity)
  - Crown (top picks/best performers)
  - FileCsv (CSV export/data download)
  - FilePdf (PDF export/report generation)
  - Download (general downloads)
  - Coins (balance totals/currency)
  - Clock (time-based filtering/24h view)
- **Spacing**: 
  - Card padding: p-6
  - Section gaps: gap-8
  - Grid gaps: gap-4 (tight), gap-6 (standard)
  - Page margins: p-8 (desktop), p-4 (mobile)
  - Button padding: px-6 py-3 (large), px-4 py-2 (standard)
- **Mobile**: 
  - Single column grid for services on mobile (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
  - Tabs convert to bottom sheet navigation
  - Service cards become full-width with stacked content
  - Transaction table converts to card list with essential info only
  - Sticky header with hamburger menu for navigation
  - Bottom floating action button for quick purchases
