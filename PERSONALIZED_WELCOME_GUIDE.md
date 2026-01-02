# Personalized Welcome Messages - Feature Guide

## Overview

The AI Agent Marketplace now features a comprehensive personalized welcome system that adapts to each user's wallet address, trading behavior, and platform activity. This system provides intelligent greetings, contextual recommendations, and detailed behavioral insights.

## Core Components

### 1. **PersonalizedWelcomeBanner** (Home Page)
Located on the main dashboard, this banner greets users with context-aware messages.

**Features:**
- Time-based greetings (morning, afternoon, evening)
- Wallet-based personality identification
- Behavioral mood detection (welcoming, celebratory, motivational, informative)
- Achievement highlights
- Personalized action suggestions
- Context-aware pro tips

**User Experience:**
- Appears automatically when visiting the marketplace
- Dismissible with animation
- Highlights recent achievements and milestones
- Provides quick-action buttons for relevant features

### 2. **PersonalizedWelcomeViewer** (Profile Tab)
A detailed profile view showing comprehensive personalization insights.

**Sections:**

#### Overview Tab
- **Personality Analysis:** Identifies user type (newcomer, explorer, builder, trader, analyst, power-user)
- **Key Traits:** Shows 3 defining characteristics based on behavior
- **Personalized Recommendations:** 4 suggested actions tailored to personality type
- **Activity Stats:** Real-time metrics (agents, transactions, total spent, services used)

#### Achievements Tab
- **Progress Tracking:** Visual progress bars for all achievements
- **Achievement Cards:** Each with icon, description, and completion status
- **11 Achievement Types:**
  - First Connection
  - First Agent Created
  - First Purchase
  - Early Adopter
  - Power User (50+ transactions)
  - Whale (1,000+ MNEE spent)
  - Explorer (15+ unique services)
  - Reviewer (10+ reviews)
  - Loyal Customer (20+ visits)
  - Collector
  - Service Provider

#### Behavior Tab
- **Spending Pattern Analysis:** Conservative, moderate, or aggressive
- **Favorite Category:** Most purchased service type
- **Activity Metrics:** Active agents, reviews written, average balance
- **Visit Statistics:** Total platform visits tracked

#### History Tab
- **Timeline View:** First visit, first transaction, latest activity
- **Account Age:** Days since registration
- **Milestone Tracking:** Key dates and events

### 3. **WelcomeMessageHistory** (Messages Tab)
A dedicated view for browsing historical welcome messages.

**Features:**
- **Current Message Display:** Shows the most recent personalized greeting
- **Historical Archive:** Stores up to 50 messages
- **Message Details Panel:** Click any message to view:
  - Timestamp
  - Mood type
  - Personality type at that time
  - Stats snapshot (agents, transactions, total spent)
  - Full message text
- **Smart Recording:** Auto-saves messages hourly (not on every page refresh)
- **Clear History:** Option to reset message archive

## Personalization Logic

### Personality Types

The system analyzes user behavior to assign one of 6 personality types:

1. **Newcomer**
   - No transactions or agents yet
   - Suggestions: Create first agent, explore services, get test MNEE

2. **Explorer**
   - Active but selective user
   - 1-4 transactions
   - Suggestions: Check bundles, compare services, view analytics

3. **Builder**
   - 2+ agents, 5+ transactions
   - Focus on automation
   - Suggestions: Build workflows, optimize agents, list services

4. **Trader**
   - 500+ MNEE spent, 15+ transactions
   - High-value transactions
   - Suggestions: AI predictions, pricing intelligence, portfolio review

5. **Analyst**
   - 5+ reviews, 10+ transactions
   - Community contributor
   - Suggestions: Deep analytics, network visualization, write reviews

6. **Power User**
   - 3+ agents, 20+ transactions
   - Platform expert
   - Suggestions: Advanced features, provider analytics, AI chat

### Mood Detection

Messages adapt their tone based on context:

- **Welcoming** 👋: New users or returning after long absence
- **Celebratory** 🎉: Achievement unlocked
- **Motivational** 🚀: First-time wallet connection with profile
- **Informative** 💡: Regular returning users

### Wallet-Based Personality

Each wallet address generates a unique persona nickname based on address hash:
- Strategic Thinker
- Innovation Pioneer
- Data Enthusiast
- Tech Explorer
- Efficiency Expert
- Creative Visionary
- Market Analyst
- Growth Hacker

## Data Persistence

All personalization data is stored using the `useKV` hook:

```typescript
// User profile storage
const [profile, setProfile] = useKV<UserProfile>('user-profile', null)

// Message history storage
const [messageHistory, setMessageHistory] = useKV<StoredWelcomeMessage[]>('welcome-message-history', [])
```

**Stored Data:**
- Wallet address
- First visit timestamp
- Last visit timestamp
- Total visits count
- Favorite categories
- Price range preferences
- Spending pattern
- Achievements array
- Onboarding status
- Personality type

## User Interface

### Visual Design

**Color Themes:**
- Welcoming: Blue to purple gradient
- Celebratory: Yellow to orange gradient
- Motivational: Green to emerald gradient
- Informative: Cyan to blue gradient

**Animations:**
- Staggered fade-in for elements
- Spring animations for icons
- Smooth transitions between tabs
- Hover effects on action cards

**Layout:**
- Responsive grid system
- Mobile-optimized tabs
- Sticky sidebar for message details
- Scrollable content areas

### Navigation

Users can access personalized features via:
1. **Home Dashboard:** PersonalizedWelcomeBanner (auto-shows)
2. **Messages Tab:** Full history and current message
3. **Profile Tab:** Comprehensive personality and behavior view

## Technical Implementation

### Key Functions

**`generatePersonalizedWelcome()`**
- Main logic for creating welcome messages
- Inputs: wallet address, profile, agents, transactions, services, reviews
- Output: PersonalizedWelcome object with greeting, message, actions, tips, highlights

**`analyzeUserBehavior()`**
- Determines personality type from activity patterns
- Analyzes transaction count, agent count, reviews, spending

**`detectAchievements()`**
- Checks completion status of all achievements
- Returns newly unlocked achievements
- Filters already earned achievements

**`getTimeBasedGreeting()`**
- Returns greeting based on current time of day
- Handles late night / early morning edge cases

**`getWalletBasedPersonality()`**
- Generates deterministic persona from wallet address
- Uses character code hashing for consistency

### React Hooks Used

- `useKV`: Persistent storage for profile and messages
- `useState`: Local component state
- `useEffect`: Data synchronization and side effects
- `motion` (Framer Motion): Animations and transitions

## Integration Points

The personalization system integrates with:

1. **Agent Dashboard:** Tracks agent creation and activity
2. **Marketplace:** Monitors service purchases
3. **Review System:** Counts user reviews
4. **Transaction History:** Analyzes spending patterns
5. **Wallet Connection:** Identifies unique users

## Future Enhancements

Potential improvements:
- AI-generated custom messages using `spark.llm`
- Social sharing of achievements
- Leaderboards for power users
- Customizable message preferences
- Export personal data feature
- Achievement NFT minting
- Streak tracking (consecutive visit days)
- Referral system integration

## Benefits

**For Users:**
- Feels personally welcomed and recognized
- Discovers relevant features based on behavior
- Tracks progress and achievements
- Understands their marketplace personality
- Gets actionable recommendations

**For Platform:**
- Increases engagement through personalization
- Guides users to appropriate features
- Encourages desired behaviors (reviews, agent creation)
- Builds emotional connection
- Reduces cognitive load with contextual suggestions

## Viewing Your Personalized Messages

### Step 1: Connect Wallet
Connect your Ethereum wallet to enable personalization tracking.

### Step 2: Use the Platform
- Create AI agents
- Purchase services
- Write reviews
- Explore different categories

### Step 3: View Insights
- **Home Page:** See your current welcome message
- **Messages Tab:** Browse message history
- **Profile Tab:** Deep dive into personality and achievements

### Step 4: Act on Suggestions
Follow personalized action recommendations to unlock more features and achievements.

---

## Code Examples

### Viewing Welcome Data Programmatically

```typescript
import { generatePersonalizedWelcome } from '@/lib/personalization'

const welcomeData = generatePersonalizedWelcome(
  walletAddress,
  profile,
  agents,
  transactions,
  services,
  reviews
)

console.log(welcomeData.greeting) // "Good morning, Strategic Thinker!"
console.log(welcomeData.mood) // "motivational"
console.log(welcomeData.suggestedActions) // Array of personalized actions
```

### Checking Achievement Progress

```typescript
import { detectAchievements } from '@/lib/personalization'

const newAchievements = detectAchievements(
  userProfile,
  agents,
  transactions,
  reviews
)

if (newAchievements.length > 0) {
  // Display achievement toast
  console.log('New achievement:', newAchievements[0])
}
```

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Feature Status:** ✅ Production Ready
