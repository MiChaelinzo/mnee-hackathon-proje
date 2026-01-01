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
- **Functionality**: AI agents can autonomously purchase services using MNEE when they need them
- **Purpose**: Demonstrate programmable money enabling agent autonomy
- **Trigger**: Agent identifies a need (simulated) or user initiates test purchase
- **Progression**: Agent evaluates need → Queries available services → Checks MNEE balance → Executes on-chain payment → Receives service access token
- **Success criteria**: Transaction completes on-chain, MNEE transfers from agent to service provider, access is granted

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
  - ChartLine (analytics/trends/historical data)
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
