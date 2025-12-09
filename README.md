# 🏏 TCC Cricket Team Builder

A professional cricket team management application that creates balanced teams using intelligent algorithms based on player statistics, roles, and batting order priority.

## 🔗 Demo

**Live Demo:** [Click here to try the app](YOUR_LIVE_LINK_HERE)

## ✨ Features

### 🎯 Smart Team Balancing
- **Intelligent Distribution**: Automatically balances teams based on:
  - Player roles (Batsmen, Bowlers, All-rounders, Wicketkeepers)
  - Batting tags (Destroyer, Hard Hitter, Accumulator, Classicist, Steady Batter)
  - Bowling tags (Spearhead, Economist, Wildcard, Aspirant)
  - Batting order priority from previous match

### 📊 Batting Order Management
- **4-Tier Priority System** for next match selection:
  1. **`*`** - No batting today (highest priority for next match)
  2. **`#`** - Less than 1 over played
  3. **Number (1-12)** - Batting position (reverse order: 12→1)
  4. **`NEW`** - Didn't play last match (lowest priority)

### 📱 WhatsApp Ready Copy
- Copy Team A or Team B with one click
- Includes player names with batting order status (*, #, position, NEW)
- Shows team composition (Batsmen, Bowlers, All-rounders, WK)
- Includes legend explaining all symbols

### 💾 Auto-Save & Restore
- Automatically saves selections and batting order to browser localStorage
- Restores your previous session when you reopen the app
- Clear saved data button to start fresh

### 🔍 Player Search & Filter
- Search players by name, batting style, or bowling style
- Filter by role (Batsman, Bowler, All-rounder, Wicketkeeper)
- Shows only selected players by default
- Search to find and add more players

### 📱 Mobile-Friendly Design
- Responsive layout optimized for all devices
- Touch-friendly interface with large buttons
- Professional cricket-themed dark mode UI
- Beautiful team cards with color-coded headers

## 🚀 Quick Start

### 1. Setup (One-Time)
Simply open `index.html` in your browser - **no server required!**

```bash
# Just double-click index.html or open it in your browser
open index.html
```

### 2. Update Player Data (Weekly)

1. Go to your team profile page on CricHeroes
2. Right-click → "View Page Source" (or Ctrl+U / Cmd+Option+U)
3. Copy all the HTML content
4. Open `playerData.js` in a text editor
5. Replace the content between the backticks in the `PLAYER_HTML` constant
6. Save the file

**Example:**
```javascript
const PLAYER_HTML = `
<!-- Paste your team profile HTML here -->
`;
```

## 📖 How to Use

### Step 1: Select Players
- Players load automatically from `playerData.js`
- Selected players appear in the "Selected Players" section
- Use search box to find and add more players
- Filter by role to quickly find specific player types
- Select 22-24 players (for two teams of 11-12 each)

### Step 2: Set Batting Order
Once you select 24+ players, the batting order section appears:
- **`*`** - Player didn't bat today
- **`#`** - Player played less than 1 over
- **Number (1-12)** - Player's batting position from today's match
- **`NEW`** - Player didn't play in last match
- Click "Save Batting Order" to save

### Step 3: Create Teams
- Click "Create Two Balanced Teams"
- Teams are balanced by:
  - Player roles and skills
  - Batting/bowling strength
  - Priority from batting order
- Players are sorted by priority in each team

### Step 4: Share Teams
- Use "Copy Team A" or "Copy Team B" buttons
- Copied text includes:
  - Player names with batting order status
  - Team composition summary
  - Legend explaining symbols
- Paste directly into WhatsApp or other messaging apps

## 🎨 Team Display

### Team Cards
- **Team A**: Blue-themed card
- **Team B**: Red-themed card
- Shows player count and role breakdown
- Players listed in priority order

### Player Status Badges
- 🔴 **`*`** - No batting (red badge)
- 🟠 **`#`** - Less over (orange badge)
- 🟢 **`8`** - Position number (green badge)
- 🔵 **`NEW`** - New player (blue badge)

## 🎯 Team Balancing Algorithm

The app uses a sophisticated multi-factor algorithm:

1. **Role Distribution**: Ensures equal wicketkeepers, batsmen, bowlers, all-rounders
2. **Skill Variety**: Balances aggressive vs steady batters, wicket-takers vs economical bowlers
3. **Priority-Based**: Respects batting order priority for fair rotation
4. **Strength Balancing**: Tracks cumulative batting and bowling strength scores

### Player Classification
- **Batsmen**: Players with batting tags but no bowling tags
- **Bowlers**: Players with bowling tags but no batting tags
- **Batting All-rounders**: High batting strength (≥4), low bowling (≤2)
- **Bowling All-rounders**: High bowling strength (≥3), low batting (≤2)
- **Genuine All-rounders**: Balanced batting and bowling abilities

### Batting Strength Scores
| Tag | Score |
|-----|-------|
| Destroyer | 5 |
| Hard Hitter | 4 |
| Accumulator | 3 |
| Classicist | 2 |
| Steady Batter | 1 |

### Bowling Strength Scores
| Tag | Score |
|-----|-------|
| Spearhead | 4 |
| Economist | 3 |
| Wildcard | 2 |
| Aspirant | 1 |

## 📁 File Structure

```
cricheroes/
├── index.html          # Main application
├── style.css           # Responsive styling with dark theme
├── script.js           # Team balancing logic
├── playerData.js       # Player HTML data (update weekly)
└── README.md           # This file
```

## 🔧 Troubleshooting

### Players not showing?
- Check that `playerData.js` has valid HTML content
- Ensure the HTML is from a valid CricHeroes team profile page
- Player names must be at least 2 characters long

### Teams not balanced?
- Ensure you've selected at least 22 players
- Set batting order for better priority-based balancing
- Check that players have valid batting/bowling tags

### Data not saving?
- Check browser localStorage is enabled
- Don't use private/incognito mode
- Use "Clear Saved Data" button if data seems corrupted

### Checkbox not showing for selected players during search?
- This has been fixed - selected players now show checked checkboxes when searching

## 💡 Tips

1. **Update player data weekly** for accurate team composition
2. **Set batting order after each match** for fairer player rotation
3. **Select 24 players** for maximum flexibility (11 per team + 2 extras)
4. **Use search** to quickly find specific players
5. **Copy teams to WhatsApp** immediately after creating for easy sharing

## 📋 Copy Format Example

When you copy a team, you get:

```
🏏 Team A - Next Match Batting Order

1. Shaym Thakkar (*)
2. Praveen Pandey (#)
3. Tushar Vachhani (8)
4. JD (7)
5. Maulik Santoki 👑 (NEW)
...

📊 Composition:
Batsmen: 3 | Bowlers: 4 | All-Rounders: 3 | WK: 1

📝 Legend: * = No Bat | # = Less Over | (1-12) = Position | NEW = New Player
```

## 🏆 Credits

Built for TCC Cricket with ❤️
