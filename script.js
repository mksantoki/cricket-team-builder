// Global state
let allPlayers = [];
let selectedPlayers = [];
let battingOrder = []; // Stores today's batting order with markers
let teamAPlayers = [];
let teamBPlayers = [];

// DOM Elements
const htmlInput = document.getElementById('htmlInput');
const parseBtn = document.getElementById('parseBtn');
const playerSection = document.getElementById('playerSection');
const battingOrderSection = document.getElementById('battingOrderSection');
const teamSection = document.getElementById('teamSection');
const resultSection = document.getElementById('resultSection');
const teamResult = document.getElementById('teamResult');
const playerList = document.getElementById('playerList');
const totalPlayersEl = document.getElementById('totalPlayers');
const selectedCountEl = document.getElementById('selectedCount');
const searchInput = document.getElementById('searchPlayer');
const roleFilter = document.getElementById('roleFilter');
const selectAllBtn = document.getElementById('selectAllBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const battingOrderGrid = document.getElementById('battingOrderGrid');
const saveBattingOrderBtn = document.getElementById('saveBattingOrderBtn');
const createTeamBtn = document.getElementById('createTeamBtn');
const copyTeamABtn = document.getElementById('copyTeamABtn');
const copyTeamBBtn = document.getElementById('copyTeamBBtn');
const selectedPlayersSection = document.getElementById('selectedPlayersSection');
const selectedPlayersList = document.getElementById('selectedPlayersList');
const selectedCountDisplay = document.getElementById('selectedCountDisplay');

// Quick Select Elements
const quickSelectBtn = document.getElementById('quickSelectBtn');
const quickSelectPanel = document.getElementById('quickSelectPanel');
const closeQuickSelect = document.getElementById('closeQuickSelect');
const quickSelectList = document.getElementById('quickSelectList');
const quickSelectCount = document.getElementById('quickSelectCount');
const doneQuickSelect = document.getElementById('doneQuickSelect');

// Event Listeners
parseBtn.addEventListener('click', parseHTML);
searchInput.addEventListener('input', filterPlayers);
roleFilter.addEventListener('change', filterPlayers);
selectAllBtn.addEventListener('click', selectAll);
clearAllBtn.addEventListener('click', clearAll);
saveBattingOrderBtn.addEventListener('click', saveBattingOrder);
createTeamBtn.addEventListener('click', createBalancedTeam);
copyTeamABtn.addEventListener('click', () => copyTeamToClipboard('A'));
copyTeamBBtn.addEventListener('click', () => copyTeamToClipboard('B'));

// Quick Select Event Listeners
quickSelectBtn.addEventListener('click', openQuickSelect);
closeQuickSelect.addEventListener('click', closeQuickSelectPanel);
doneQuickSelect.addEventListener('click', closeQuickSelectPanel);

// Quick Select Filter Buttons
document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderQuickSelectList(e.target.dataset.filter);
    });
});

// Parse HTML and extract player data
function parseHTML() {
    const htmlContent = htmlInput.value.trim();

    if (!htmlContent) {
        alert('Please paste HTML content first!');
        return;
    }

    try {
        // Create a temporary DOM element to parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Extract players - this will need to be customized based on actual HTML structure
        allPlayers = extractPlayers(doc);

        if (allPlayers.length === 0) {
            alert('No players found in the HTML. Please check the format.');
            return;
        }

        // Show player section
        playerSection.style.display = 'block';
        teamSection.style.display = 'block';

        // Update stats
        totalPlayersEl.textContent = allPlayers.length;
        selectedCountEl.textContent = '0';

        // Render players
        renderPlayers(allPlayers);

        // Scroll to player section
        playerSection.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error parsing HTML:', error);
        alert('Error parsing HTML. Please check the console for details.');
    }
}

// Auto-load player data on page load
function autoLoadPlayers() {
    try {
        // Check if PLAYER_HTML is defined and not empty
        if (typeof PLAYER_HTML === 'undefined' || !PLAYER_HTML.trim()) {
            console.warn('PLAYER_HTML is empty. Please update playerData.js with player HTML data.');
            alert('No player data found. Please update playerData.js with player HTML data.');
            return;
        }

        // Parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(PLAYER_HTML, 'text/html');

        // Extract players
        allPlayers = extractPlayers(doc);

        if (allPlayers.length === 0) {
            console.warn('No players found in PLAYER_HTML');
            alert('No players found. Please check the HTML in playerData.js.');
            return;
        }

        // Show player section
        playerSection.style.display = 'block';

        // Update stats
        totalPlayersEl.textContent = allPlayers.length;
        selectedCountEl.textContent = '0';

        // Render players (initially shows only selected players)
        filterPlayers();

        // Try to restore from localStorage
        loadFromLocalStorage();

        console.log(`Auto-loaded ${allPlayers.length} players from playerData.js`);

    } catch (error) {
        console.error('Error auto-loading players:', error);
        alert('Error loading player data. Please check the console for details.');
    }
}

// Call auto-load when page loads
window.addEventListener('DOMContentLoaded', autoLoadPlayers);

// LocalStor// Save to localStorage
function saveToLocalStorage() {
    try {
        const data = {
            selectedPlayerIds: selectedPlayers.map(p => p.id),
            battingOrder: battingOrder.map(entry => ({
                playerId: entry.playerId,
                status: entry.status,
                position: entry.position
            })),
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('cricketTeamBuilder', JSON.stringify(data));
        console.log('Saved to localStorage:', data);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('cricketTeamBuilder');
        if (!saved) return;

        const data = JSON.parse(saved);

        // Restore selected players
        if (data.selectedPlayerIds && Array.isArray(data.selectedPlayerIds)) {
            selectedPlayers = [];
            data.selectedPlayerIds.forEach(id => {
                const player = allPlayers.find(p => p.id === id);
                if (player) {
                    selectedPlayers.push(player);
                    const checkbox = document.querySelector(`input[data-player-id="${id}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        checkbox.closest('.player-card')?.classList.add('selected');
                    }
                }
            });

            selectedCountEl.textContent = selectedPlayers.length;

            // Render selected players section
            renderSelectedPlayers();

            // Show batting order section if enough players
            if (selectedPlayers.length >= 24) {
                battingOrderSection.style.display = 'block';
            }
        }

        // Restore batting order
        if (data.battingOrder && Array.isArray(data.battingOrder)) {
            battingOrder = data.battingOrder;

            // Apply batting order to players
            battingOrder.forEach(order => {
                const player = selectedPlayers.find(p => p.id === order.playerId);
                if (player) {
                    player.battingOrderStatus = order.status;
                    player.battingOrderPosition = order.position;
                }
            });

            // Re-render batting order inputs if section is visible
            if (battingOrderSection.style.display === 'block') {
                renderBattingOrderInputs();

                // Restore the UI state after rendering
                setTimeout(() => {
                    battingOrder.forEach(order => {
                        // Find and check the correct radio button
                        const radio = document.querySelector(`input[name="player-${order.playerId}"][value="${order.status}"]`);
                        if (radio) {
                            radio.checked = true;

                            // If it's a number position, enable and set the dropdown
                            if (order.status === 'number' && order.position) {
                                const select = document.querySelector(`.position-select[data-player-id="${order.playerId}"]`);
                                if (select) {
                                    select.disabled = false;
                                    select.value = order.position;
                                }
                            }
                        }
                    });
                }, 100);
            }
        }
        console.log('Restored from localStorage:', selectedPlayers.length, 'players selected');
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

function clearLocalStorage() {
    if (confirm('Are you sure you want to clear all saved data? This will reset player selections and batting order.')) {
        localStorage.removeItem('cricketTeamBuilder');
        location.reload();
    }
}

// Extract players from parsed HTML
function extractPlayers(doc) {
    const players = [];

    // Look for player cards - they use specific class patterns
    const playerCards = doc.querySelectorAll('.col-lg-4, .col-md-6, .col-sm-6, .col-xs-12');

    playerCards.forEach((card, index) => {
        const player = {
            id: index,
            name: '',
            role: 'allrounder',
            battingStyle: '',
            bowlingStyle: '',
            isCaptain: false,
            matches: 0,
            runs: 0,
            wickets: 0,
            average: 0,
            strikeRate: 0,
            economy: 0
        };

        // Extract name from topRow span
        const nameElement = card.querySelector('.topRow span:first-child');
        if (nameElement) {
            player.name = nameElement.textContent.trim();
        }

        // Check if captain
        const captainElement = card.querySelector('.captain');
        if (captainElement) {
            player.isCaptain = true;
        }

        // Extract batting and bowling styles from buttons
        const buttons = card.querySelectorAll('button');
        buttons.forEach((button, btnIndex) => {
            const style = button.textContent.trim();
            if (btnIndex === 0) {
                player.battingStyle = style;
            } else if (btnIndex === 1) {
                player.bowlingStyle = style;
            }
        });

        // Determine role based on batting and bowling styles
        player.role = determineRoleFromStyles(player.battingStyle, player.bowlingStyle);

        // Generate some sample stats based on role (since actual stats aren't in the HTML)
        player.matches = Math.floor(Math.random() * 50) + 10;

        if (player.role === 'batsman' || player.role === 'allrounder' || player.role === 'wicketkeeper') {
            player.runs = Math.floor(Math.random() * 1000) + 200;
            player.average = parseFloat((player.runs / player.matches).toFixed(1));
            player.strikeRate = parseFloat((Math.random() * 50 + 100).toFixed(1));
        }

        if (player.role === 'bowler' || player.role === 'allrounder') {
            player.wickets = Math.floor(Math.random() * 40) + 5;
            player.economy = parseFloat((Math.random() * 3 + 6).toFixed(1));
        }

        // Only add if we found a name
        if (player.name && player.name.length >= 2) {
            players.push(player);
        }
    });

    return players;
}

// Determine role from batting and bowling styles
function determineRoleFromStyles(battingStyle, bowlingStyle) {
    const batting = battingStyle.toLowerCase();
    const bowling = bowlingStyle.toLowerCase();

    // Batting tags
    const battingTags = ['steady batter', 'classicist', 'accumulator', 'hard hitter', 'destroyer'];
    const isBatsman = battingTags.some(tag => batting.includes(tag));

    // Bowling tags
    const bowlingTags = ['aspirant', 'wildcard', 'economist', 'spearhead'];
    const isBowler = bowlingTags.some(tag => bowling.includes(tag));

    // Determine role based on tags
    if (isBatsman && isBowler) {
        // Both tags present - determine primary strength
        const battingStr = getBattingStrength(battingStyle);
        const bowlingStr = getBowlingStrength(bowlingStyle);

        // If one skill is significantly stronger, classify accordingly
        if (battingStr >= 4 && bowlingStr <= 2) {
            return 'batsman'; // Batting all-rounder (like Accumulator-Economist)
        } else if (bowlingStr >= 3 && battingStr <= 2) {
            return 'bowler'; // Bowling all-rounder (like Steady-Spearhead)
        } else {
            return 'allrounder'; // Genuine all-rounder
        }
    } else if (isBatsman) {
        return 'batsman';
    } else if (isBowler) {
        return 'bowler';
    } else {
        // Default to allrounder if no clear tags
        return 'allrounder';
    }
}

// Get batting strength score (for team balancing)
function getBattingStrength(battingStyle) {
    const style = battingStyle.toLowerCase();
    // Higher score = more aggressive batting
    if (style.includes('destroyer')) return 5;
    if (style.includes('hard hitter')) return 4;
    if (style.includes('accumulator')) return 3;
    if (style.includes('classicist')) return 2;
    if (style.includes('steady')) return 1;
    return 2; // default
}

// Get bowling strength score (for team balancing)
function getBowlingStrength(bowlingStyle) {
    const style = bowlingStyle.toLowerCase();
    // Higher score = more wicket-taking ability
    if (style.includes('spearhead')) return 4;
    if (style.includes('economist')) return 3;
    if (style.includes('wildcard')) return 2;
    if (style.includes('aspirant')) return 1;
    return 2; // default
}
// Helper function to determine role from text
function determineRole(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('batsman') || lowerText.includes('batter')) return 'batsman';
    if (lowerText.includes('bowler')) return 'bowler';
    if (lowerText.includes('all-rounder') || lowerText.includes('allrounder')) return 'allrounder';
    if (lowerText.includes('wicket keeper') || lowerText.includes('wicketkeeper')) return 'wicketkeeper';
    return 'allrounder';
}

// Helper function to extract numbers
function extractNumber(text) {
    if (!text) return 0;
    const match = text.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
}

// Render players
function renderPlayers(players) {
    playerList.innerHTML = '';

    players.forEach(player => {
        const card = createPlayerCard(player);
        playerList.appendChild(card);
    });
}

// Create player card
function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.dataset.playerId = player.id;
    card.dataset.role = player.role;

    // Check if player is already selected
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    if (isSelected) {
        card.classList.add('selected');
    }

    const captainBadge = player.isCaptain ? '<span class="captain-badge">👑 Captain</span>' : '';
    const battingInfo = player.battingStyle ? `<span class="style-badge batting">${player.battingStyle}</span>` : '';
    const bowlingInfo = player.bowlingStyle ? `<span class="style-badge bowling">${player.bowlingStyle}</span>` : '';

    card.innerHTML = `
        <div class="player-header">
            <div>
                <div class="player-name">${player.name} ${captainBadge}</div>
                <span class="player-role role-${player.role}">${player.role}</span>
            </div>
            <div class="checkbox-wrapper">
                <input type="checkbox" class="player-checkbox" data-player-id="${player.id}" ${isSelected ? 'checked' : ''}>
            </div>
        </div>
        <div class="player-styles">
            ${battingInfo}
            ${bowlingInfo}
        </div>
        <div class="player-stats">
            <div class="stat"><strong>Matches:</strong> ${player.matches}</div>
            <div class="stat"><strong>Runs:</strong> ${player.runs}</div>
            <div class="stat"><strong>Wickets:</strong> ${player.wickets}</div>
            <div class="stat"><strong>Average:</strong> ${player.average.toFixed(1)}</div>
        </div>
    `;

    // Add click event
    const checkbox = card.querySelector('.player-checkbox');
    card.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            togglePlayerSelection(player.id, checkbox.checked);
        }
    });

    checkbox.addEventListener('change', (e) => {
        togglePlayerSelection(player.id, e.target.checked);
    });

    return card;
}

// Render selected players in dedicated section
function renderSelectedPlayers() {
    if (selectedPlayers.length === 0) {
        selectedPlayersSection.style.display = 'none';
        return;
    }

    selectedPlayersSection.style.display = 'block';
    selectedCountDisplay.textContent = selectedPlayers.length;

    selectedPlayersList.innerHTML = selectedPlayers.map(player => {
        const captainBadge = player.isCaptain ? ' <span class="captain-badge">C</span>' : '';
        return `
            <div class="selected-player-chip">
                <div class="player-chip-info">
                    <div class="player-chip-name" title="${player.name}">${player.name}${captainBadge}</div>
                    <div class="player-chip-role">${player.role}</div>
                </div>
                <button class="remove-player-btn" data-player-id="${player.id}" title="Remove player">×</button>
            </div>
        `;
    }).join('');

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-player-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const playerId = e.target.dataset.playerId;
            const player = allPlayers.find(p => p.id === playerId);
            if (player) {
                togglePlayerSelection(playerId, false);
            }
        });
    });
}

// Toggle player selection
function togglePlayerSelection(playerId, isSelected) {
    const card = document.querySelector(`[data-player-id="${playerId}"]`).closest('.player-card');

    if (isSelected) {
        card.classList.add('selected');
        const player = allPlayers.find(p => p.id === playerId);
        if (player && !selectedPlayers.find(p => p.id === playerId)) {
            selectedPlayers.push(player);
        }
    } else {
        card.classList.remove('selected');
        selectedPlayers = selectedPlayers.filter(p => p.id !== playerId);
    }

    selectedCountEl.textContent = selectedPlayers.length;

    // Render selected players section
    renderSelectedPlayers();

    // Save to localStorage
    saveToLocalStorage();

    // Refresh the player list to update visibility
    filterPlayers();

    // Show batting order section when 24 players are selected
    if (selectedPlayers.length >= 24) {
        battingOrderSection.style.display = 'block';
        renderBattingOrderInputs();
        battingOrderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        battingOrderSection.style.display = 'none';
        teamSection.style.display = 'none';
        resultSection.style.display = 'none';
    }
}

// Filter players based on search and role
function filterPlayers() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedRole = roleFilter.value;

    let filtered = allPlayers;

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(player =>
            player.name.toLowerCase().includes(searchTerm) ||
            player.battingStyle.toLowerCase().includes(searchTerm) ||
            player.bowlingStyle.toLowerCase().includes(searchTerm)
        );
    }

    // Apply role filter
    if (selectedRole !== 'all') {
        filtered = filtered.filter(player => player.role === selectedRole);
    }

    // If no search/filter is active, only show selected players
    if (!searchTerm && selectedRole === 'all') {
        filtered = allPlayers.filter(player =>
            selectedPlayers.find(p => p.id === player.id)
        );

        // Don't show any message - selected players are shown in the section above
        if (filtered.length === 0) {
            playerList.innerHTML = '';
            return;
        }
    }

    // Show message if search returns no results
    if (filtered.length === 0) {
        playerList.innerHTML = '<p class="no-players">No players found matching your search.</p>';
        return;
    }

    renderPlayers(filtered);
}

// Select all visible players
function selectAll() {
    const visibleCheckboxes = document.querySelectorAll('.player-checkbox');
    visibleCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        const playerId = parseInt(checkbox.dataset.playerId);
        const player = allPlayers.find(p => p.id === playerId);
        if (player && !selectedPlayers.find(p => p.id === playerId)) {
            selectedPlayers.push(player);
        }
        checkbox.closest('.player-card').classList.add('selected');
    });
    selectedCountEl.textContent = selectedPlayers.length;
}

// Clear all selections
function clearAll() {
    const checkboxes = document.querySelectorAll('.player-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.player-card').classList.remove('selected');
    });
    selectedPlayers = [];
    selectedCountEl.textContent = '0';
}

// Create balanced team
function createBalancedTeam() {
    if (selectedPlayers.length < 22) {
        alert(`Please select at least 22 players to create two balanced teams. Currently selected: ${selectedPlayers.length}`);
        return;
    }

    // Analyze and create two balanced teams
    const teams = balanceTwoTeams(selectedPlayers);

    // Display result
    displayTwoTeams(teams);

    // Scroll to result
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Balance two teams algorithm
function balanceTwoTeams(players) {
    // Use priority order if batting order is set
    let orderedPlayers = players;
    let hasBattingOrder = battingOrder.length > 0;

    if (hasBattingOrder) {
        orderedPlayers = calculateNextMatchPriority();
    }

    // Categorize all players by role
    const categorized = {
        batsmen: [],
        bowlers: [],
        allrounders: [],
        wicketkeepers: []
    };

    orderedPlayers.forEach(player => {
        // Add batting order info to player if available
        if (hasBattingOrder) {
            const orderEntry = battingOrder.find(e => e.playerId === player.id);
            if (orderEntry) {
                player.battingOrderStatus = orderEntry.status;
                player.battingOrderPosition = orderEntry.position;
            }
        }

        switch (player.role) {
            case 'batsman':
                categorized.batsmen.push(player);
                break;
            case 'bowler':
                categorized.bowlers.push(player);
                break;
            case 'allrounder':
                categorized.allrounders.push(player);
                break;
            case 'wicketkeeper':
                categorized.wicketkeepers.push(player);
                break;
        }
    });

    // Sort by performance AND style strength (priority already applied in order)
    if (!hasBattingOrder) {
        categorized.batsmen.sort((a, b) => {
            const scoreA = (a.runs + a.average * 10) + getBattingStrength(a.battingStyle) * 50;
            const scoreB = (b.runs + b.average * 10) + getBattingStrength(b.battingStyle) * 50;
            return scoreB - scoreA;
        });

        categorized.bowlers.sort((a, b) => {
            const scoreA = (a.wickets * 10 - a.economy * 5) + getBowlingStrength(a.bowlingStyle) * 50;
            const scoreB = (b.wickets * 10 - b.economy * 5) + getBowlingStrength(b.bowlingStyle) * 50;
            return scoreB - scoreA;
        });

        categorized.allrounders.sort((a, b) => {
            const scoreA = (a.runs + a.wickets * 20) +
                (getBattingStrength(a.battingStyle) + getBowlingStrength(a.bowlingStyle)) * 25;
            const scoreB = (b.runs + b.wickets * 20) +
                (getBattingStrength(b.battingStyle) + getBowlingStrength(b.bowlingStyle)) * 25;
            return scoreB - scoreA;
        });

        categorized.wicketkeepers.sort((a, b) => b.runs - a.runs);
    }

    // Initialize two teams
    const teamA = [];
    const teamB = [];

    // Track team strengths for balancing
    const teamStats = {
        A: {
            battingStrength: 0,
            bowlingStrength: 0,
            priorityPlayers: 0,
            aggressiveBatters: 0,  // Hard Hitter, Destroyer
            steadyBatters: 0,      // Steady, Classicist
            wicketTakers: 0,       // Spearhead, Wildcard
            economicalBowlers: 0   // Economist, Aspirant
        },
        B: {
            battingStrength: 0,
            bowlingStrength: 0,
            priorityPlayers: 0,
            aggressiveBatters: 0,
            steadyBatters: 0,
            wicketTakers: 0,
            economicalBowlers: 0
        }
    };

    // Helper function to categorize player type
    function categorizePlayerType(player) {
        const batting = player.battingStyle.toLowerCase();
        const bowling = player.bowlingStyle.toLowerCase();

        return {
            isAggressiveBatter: batting.includes('hard hitter') || batting.includes('destroyer'),
            isSteadyBatter: batting.includes('steady') || batting.includes('classicist'),
            isWicketTaker: bowling.includes('spearhead') || bowling.includes('wildcard'),
            isEconomical: bowling.includes('economist') || bowling.includes('aspirant')
        };
    }

    // Helper function to add player to team with balanced distribution
    function addPlayerToTeam(player, preferredTeam = null) {
        let targetTeam;

        if (preferredTeam) {
            targetTeam = preferredTeam;
        } else {
            // Choose team based on current balance
            const teamASize = teamA.length;
            const teamBSize = teamB.length;

            if (teamASize < teamBSize) {
                targetTeam = 'A';
            } else if (teamBSize < teamASize) {
                targetTeam = 'B';
            } else {
                // Same size - balance by multiple factors
                const playerType = categorizePlayerType(player);

                // Calculate balance scores
                const strengthDiffA =
                    (teamStats.A.battingStrength + teamStats.A.bowlingStrength) -
                    (teamStats.B.battingStrength + teamStats.B.bowlingStrength);

                const varietyDiffA =
                    (teamStats.A.aggressiveBatters + teamStats.A.wicketTakers) -
                    (teamStats.B.aggressiveBatters + teamStats.B.wicketTakers);

                // Prefer team with lower overall strength
                if (Math.abs(strengthDiffA) > 2) {
                    targetTeam = strengthDiffA > 0 ? 'B' : 'A';
                }
                // If strength is similar, balance by player variety
                else if (playerType.isAggressiveBatter || playerType.isWicketTaker) {
                    targetTeam = varietyDiffA > 0 ? 'B' : 'A';
                } else {
                    targetTeam = varietyDiffA < 0 ? 'B' : 'A';
                }
            }
        }

        // Add player and update stats
        const playerType = categorizePlayerType(player);

        if (targetTeam === 'A') {
            teamA.push(player);
            teamStats.A.battingStrength += getBattingStrength(player.battingStyle);
            teamStats.A.bowlingStrength += getBowlingStrength(player.bowlingStyle);
            if (player.battingOrderStatus === '*' || player.battingOrderStatus === '#') {
                teamStats.A.priorityPlayers++;
            }
            if (playerType.isAggressiveBatter) teamStats.A.aggressiveBatters++;
            if (playerType.isSteadyBatter) teamStats.A.steadyBatters++;
            if (playerType.isWicketTaker) teamStats.A.wicketTakers++;
            if (playerType.isEconomical) teamStats.A.economicalBowlers++;
        } else {
            teamB.push(player);
            teamStats.B.battingStrength += getBattingStrength(player.battingStyle);
            teamStats.B.bowlingStrength += getBowlingStrength(player.bowlingStyle);
            if (player.battingOrderStatus === '*' || player.battingOrderStatus === '#') {
                teamStats.B.priorityPlayers++;
            }
            if (playerType.isAggressiveBatter) teamStats.B.aggressiveBatters++;
            if (playerType.isSteadyBatter) teamStats.B.steadyBatters++;
            if (playerType.isWicketTaker) teamStats.B.wicketTakers++;
            if (playerType.isEconomical) teamStats.B.economicalBowlers++;
        }
    }

    // Distribute wicketkeepers first (1 per team)
    if (categorized.wicketkeepers.length >= 2) {
        addPlayerToTeam(categorized.wicketkeepers[0], 'A');
        addPlayerToTeam(categorized.wicketkeepers[1], 'B');
    } else if (categorized.wicketkeepers.length === 1) {
        addPlayerToTeam(categorized.wicketkeepers[0], 'A');
    }

    // Distribute batsmen alternately with balance consideration
    categorized.batsmen.forEach(player => {
        if (teamA.length < 11 || teamB.length < 11) {
            addPlayerToTeam(player);
        }
    });

    // Distribute all-rounders
    categorized.allrounders.forEach(player => {
        if (teamA.length < 11 || teamB.length < 11) {
            addPlayerToTeam(player);
        }
    });

    // Distribute bowlers
    categorized.bowlers.forEach(player => {
        if (teamA.length < 11 || teamB.length < 11) {
            addPlayerToTeam(player);
        }
    });

    // Fill remaining spots to make exactly 11 per team
    const allPlayers = [...categorized.batsmen, ...categorized.bowlers, ...categorized.allrounders, ...categorized.wicketkeepers];

    while (teamA.length < 11 && allPlayers.length > 0) {
        const player = allPlayers.find(p => !teamA.includes(p) && !teamB.includes(p));
        if (player) addPlayerToTeam(player, 'A');
        else break;
    }

    while (teamB.length < 11 && allPlayers.length > 0) {
        const player = allPlayers.find(p => !teamA.includes(p) && !teamB.includes(p));
        if (player) addPlayerToTeam(player, 'B');
        else break;
    }

    // Store teams globally for WhatsApp export
    teamAPlayers = teamA.slice(0, 11);
    teamBPlayers = teamB.slice(0, 11);

    console.log('Team A Stats:', teamStats.A);
    console.log('Team B Stats:', teamStats.B);

    return {
        teamA: teamAPlayers,
        teamB: teamBPlayers
    };
}

// Helper function to distribute players between teams
function distributePlayers(players, teamA, teamB, targetPerTeam) {
    let toTeamA = true;
    let countA = 0;
    let countB = 0;

    for (const player of players) {
        if (countA >= targetPerTeam && countB >= targetPerTeam) break;

        if (toTeamA && countA < targetPerTeam) {
            teamA.push(player);
            countA++;
            toTeamA = false;
        } else if (!toTeamA && countB < targetPerTeam) {
            teamB.push(player);
            countB++;
            toTeamA = true;
        } else if (countA < targetPerTeam) {
            teamA.push(player);
            countA++;
        } else if (countB < targetPerTeam) {
            teamB.push(player);
            countB++;
        }
    }
}

// Display two teams
function displayTwoTeams(teams) {
    let { teamA, teamB } = teams;

    // Sort teams by batting order priority if available
    const sortByPriority = (players) => {
        return players.slice().sort((a, b) => {
            // Get priority scores
            const getPriority = (player) => {
                if (!player.battingOrderStatus) return 1000; // No status = lowest priority

                if (player.battingOrderStatus === '*') return 0; // Highest priority
                if (player.battingOrderStatus === '#') return 100; // Second priority
                if (player.battingOrderStatus === 'number' && player.battingOrderPosition) {
                    return 200 + (12 - player.battingOrderPosition); // Reverse order: 12=200, 11=201, 1=211
                }
                if (player.battingOrderStatus === 'new') return 1000; // Lowest priority

                return 1000;
            };

            return getPriority(a) - getPriority(b);
        });
    };

    // Sort both teams by priority
    teamA = sortByPriority(teamA);
    teamB = sortByPriority(teamB);

    // Update global variables with sorted teams so copy function uses same order
    teamAPlayers = teamA;
    teamBPlayers = teamB;

    // Calculate team stats
    const statsA = calculateTeamStats(teamA);
    const statsB = calculateTeamStats(teamB);

    // Create HTML for both teams
    let html = `
        <div class="teams-container">
            <div class="team-card">
                <div class="team-header">
                    <h2>Team A</h2>
                    <div class="team-stats-summary">
                        <span>👥 ${teamA.length} Players</span>
                        <span>🏏 ${statsA.batsmen} Batsmen</span>
                        <span>⚡ ${statsA.allrounders} All-rounders</span>
                        <span>🎯 ${statsA.bowlers} Bowlers</span>
                    </div>
                </div>
                <div class="players-list">
                    ${teamA.map((player, index) => createPlayerListItem(player, index + 1)).join('')}
                </div>
            </div>

            <div class="vs-divider">VS</div>

            <div class="team-card">
                <div class="team-header">
                    <h2>Team B</h2>
                    <div class="team-stats-summary">
                        <span>👥 ${teamB.length} Players</span>
                        <span>🏏 ${statsB.batsmen} Batsmen</span>
                        <span>⚡ ${statsB.allrounders} All-rounders</span>
                        <span>🎯 ${statsB.bowlers} Bowlers</span>
                    </div>
                </div>
                <div class="players-list">
                    ${teamB.map((player, index) => createPlayerListItem(player, index + 1)).join('')}
                </div>
            </div>
        </div>
    `;

    teamResult.innerHTML = html;
}

// Create player list item for team display
function createPlayerListItem(player, index) {
    const captainBadge = player.isCaptain ? '<span class="captain-badge">C</span>' : '';

    // Get batting order status
    let battingOrderBadge = '';
    const orderData = battingOrder.find(o => o.playerId === player.id);
    if (orderData) {
        if (orderData.status === '*') {
            battingOrderBadge = '<span class="batting-status-badge no-bat">*</span>';
        } else if (orderData.status === '#') {
            battingOrderBadge = '<span class="batting-status-badge less-over">#</span>';
        } else if (orderData.status === 'number' && orderData.position) {
            battingOrderBadge = `<span class="batting-status-badge position">${orderData.position}</span>`;
        } else if (orderData.status === 'new') {
            battingOrderBadge = '<span class="batting-status-badge new-player">NEW</span>';
        }
    }

    // Show actual player tags instead of role
    let styleInfo = '';
    if (player.battingStyle && player.bowlingStyle) {
        styleInfo = `<span class="player-tags">${player.battingStyle} - ${player.bowlingStyle}</span>`;
    } else if (player.battingStyle) {
        styleInfo = `<span class="player-tags">${player.battingStyle}</span>`;
    } else if (player.bowlingStyle) {
        styleInfo = `<span class="player-tags">${player.bowlingStyle}</span>`;
    }

    return `
        <div class="player-list-item">
            <span class="player-number">${index}</span>
            <div class="player-info">
                <span class="player-name">${player.name} ${captainBadge} ${battingOrderBadge}</span>
                ${styleInfo}
            </div>
        </div>
    `;
}

// Calculate team statistics
function calculateTeamStats(team) {
    return {
        totalRuns: team.reduce((sum, p) => sum + p.runs, 0),
        totalWickets: team.reduce((sum, p) => sum + p.wickets, 0),
        avgRuns: Math.round(team.reduce((sum, p) => sum + p.runs, 0) / team.length),
        avgWickets: Math.round(team.reduce((sum, p) => sum + p.wickets, 0) / team.length),
        batsmen: team.filter(p => p.role === 'batsman').length,
        bowlers: team.filter(p => p.role === 'bowler').length,
        allrounders: team.filter(p => p.role === 'allrounder').length,
        wicketkeepers: team.filter(p => p.role === 'wicketkeeper').length
    };
}

// Render batting order inputs for all selected players
function renderBattingOrderInputs() {
    if (selectedPlayers.length === 0) return;

    let html = '';

    selectedPlayers.forEach(player => {
        const captainBadge = player.isCaptain ? '<span class="captain-badge">C</span>' : '';
        html += `
            <div class="batting-order-row">
                <div class="player-info-batting">
                    <span class="player-name-batting">${player.name} ${captainBadge}</span>
                </div>
                <div class="batting-options">
                    <label class="option-label">
                        <input type="radio" name="player-${player.id}" value="*" class="batting-radio">
                        <span class="option-text">*</span>
                    </label>
                    <label class="option-label">
                        <input type="radio" name="player-${player.id}" value="#" class="batting-radio">
                        <span class="option-text">#</span>
                    </label>
                    <label class="option-label number-option">
                        <input type="radio" name="player-${player.id}" value="number" class="batting-radio position-radio" data-player-id="${player.id}">
                        <select class="position-select" data-player-id="${player.id}" disabled>
                            <option value="">Position</option>
                            ${Array.from({ length: 12 }, (_, i) => i + 1).map(num =>
            `<option value="${num}">${num}</option>`
        ).join('')}
                        </select>
                    </label>
                    <label class="option-label">
                        <input type="radio" name="player-${player.id}" value="new" class="batting-radio" checked>
                        <span class="option-text">NEW</span>
                    </label>
                </div>
            </div>
        `;
    });

    battingOrderGrid.innerHTML = html;

    // Add event listeners to enable/disable position dropdowns
    document.querySelectorAll('.position-radio').forEach(radio => {
        radio.addEventListener('change', function () {
            const playerId = this.dataset.playerId;
            const select = document.querySelector(`.position-select[data-player-id="${playerId}"]`);
            if (this.checked) {
                select.disabled = false;
                select.focus(); // Auto-focus on the dropdown
            }
        });
    });

    // Add event listeners to disable dropdown when other options are selected
    document.querySelectorAll('.batting-radio:not(.position-radio)').forEach(radio => {
        radio.addEventListener('change', function () {
            const playerId = this.name.replace('player-', '');
            const select = document.querySelector(`.position-select[data-player-id="${playerId}"]`);
            if (select) {
                select.disabled = true;
                select.value = '';
            }
        });
    });
}

// Save batting order
function saveBattingOrder() {
    battingOrder = [];

    selectedPlayers.forEach(player => {
        if (!player || !player.id) {
            console.warn('Invalid player found:', player);
            return;
        }

        const radioChecked = document.querySelector(`input[name="player-${player.id}"]:checked`);

        if (radioChecked) {
            const status = radioChecked.value;
            let position = null;

            if (status === 'number') {
                const select = document.querySelector(`.position-select[data-player-id="${player.id}"]`);
                position = select ? select.value : null;
            }

            battingOrder.push({
                playerId: player.id,
                status: status,
                position: position
            });

            // Also update the player object directly for easy access during team creation
            player.battingOrderStatus = status;
            player.battingOrderPosition = position;
        }
    });

    console.log('Selected players:', selectedPlayers);
    console.log('Batting order created:', battingOrder);

    saveToLocalStorage();

    // Show team creation section
    teamSection.style.display = 'block';
    teamSection.scrollIntoView({ behavior: 'smooth' });

    alert(`Batting order saved for ${battingOrder.length} players! Now create balanced teams.`);
}

// Calculate next match priority
function calculateNextMatchPriority() {
    const priorities = {
        numbered: [],   // Players with batting positions (sorted by reverse position)
        noBat: [],      // * players - No batting
        lessOver: [],   // # players - Less than 1 over
        newPlayers: []  // New players - Didn't play last match (lowest priority)
    };

    // Categorize all players by their status
    battingOrder.forEach(entry => {
        const player = selectedPlayers.find(p => p.id === entry.playerId);
        if (!player) return;

        if (entry.status === 'number' && entry.position) {
            priorities.numbered.push({ ...player, battingPosition: parseInt(entry.position) });
        } else if (entry.status === '*') {
            priorities.noBat.push(player);
        } else if (entry.status === '#') {
            priorities.lessOver.push(player);
        } else if (entry.status === 'new') {
            priorities.newPlayers.push(player);
        }
    });

    // Sort numbered players in reverse order (12, 11, 10... 1)
    priorities.numbered.sort((a, b) => b.battingPosition - a.battingPosition);

    // Remove battingPosition property before returning
    const numberedPlayers = priorities.numbered.map(p => {
        const { battingPosition, ...player } = p;
        return player;
    });

    // Priority order for next match:
    // 1. Numbered players in reverse order (12→1)
    // 2. * players (no batting)
    // 3. # players (less than 1 over)
    // 4. New players (didn't play last match)
    return [
        ...numberedPlayers,
        ...priorities.noBat,
        ...priorities.lessOver,
        ...priorities.newPlayers
    ];
}

// Copy team to clipboard for WhatsApp
async function copyTeamToClipboard(teamLetter) {
    const team = teamLetter === 'A' ? teamAPlayers : teamBPlayers;

    if (!team || team.length === 0) {
        alert('Please create teams first!');
        return;
    }

    let text = `🏏 Team ${teamLetter} - Next Match Batting Order\n\n`;

    team.forEach((player, index) => {
        text += `${index + 1}. ${player.name}`;
        if (player.isCaptain) text += ' 👑';

        // Add batting order status
        const orderData = battingOrder.find(o => o.playerId === player.id);
        if (orderData) {
            if (orderData.status === '*') {
                text += ' (*)';
            } else if (orderData.status === '#') {
                text += ' (#)';
            } else if (orderData.status === 'number' && orderData.position) {
                text += ` (${orderData.position})`;
            } else if (orderData.status === 'new') {
                text += ' (NEW)';
            }
        }

        text += `\n`;
    });

    text += `\n📊 Composition:\n`;
    const composition = team.reduce((acc, player) => {
        acc[player.role] = (acc[player.role] || 0) + 1;
        return acc;
    }, {});

    text += `Batsmen: ${composition.batsman || 0} | `;
    text += `Bowlers: ${composition.bowler || 0} | `;
    text += `All-Rounders: ${composition.allrounder || 0} | `;
    text += `WK: ${composition.wicketkeeper || 0}`;

    text += `\n\n📝 Legend: * = No Bat | # = Less Over | (1-12) = Position | NEW = New Player`;

    try {
        await navigator.clipboard.writeText(text);
        alert(`Team ${teamLetter} copied to clipboard! Ready to paste in WhatsApp.`);
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert(`Team ${teamLetter} copied to clipboard!`);
    }
}

// ==================== QUICK SELECT FUNCTIONS ====================

// Open Quick Select Panel
function openQuickSelect() {
    quickSelectPanel.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    renderQuickSelectList('all');
    updateQuickSelectCount();
}

// Close Quick Select Panel
function closeQuickSelectPanel() {
    quickSelectPanel.style.display = 'none';
    document.body.style.overflow = ''; // Restore scroll
    
    // Refresh main view
    filterPlayers();
    renderSelectedPlayers();
    
    // Check if we need to show batting order section
    if (selectedPlayers.length >= 24) {
        battingOrderSection.style.display = 'block';
        renderBattingOrderInputs();
    } else {
        battingOrderSection.style.display = 'none';
        teamSection.style.display = 'none';
        resultSection.style.display = 'none';
    }
}

// Render Quick Select List
function renderQuickSelectList(filter = 'all') {
    let players = allPlayers;
    
    if (filter !== 'all') {
        players = allPlayers.filter(p => p.role === filter);
    }
    
    // Sort alphabetically for easier finding
    players = players.slice().sort((a, b) => a.name.localeCompare(b.name));
    
    quickSelectList.innerHTML = players.map(player => {
        const isSelected = selectedPlayers.some(p => p.id === player.id);
        return `
            <div class="quick-select-item ${isSelected ? 'selected' : ''}" data-player-id="${player.id}">
                <div class="quick-check"></div>
                <div class="quick-player-info">
                    <div class="quick-player-name">${player.name}</div>
                    <div class="quick-player-role">${player.role}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click listeners
    document.querySelectorAll('.quick-select-item').forEach(item => {
        item.addEventListener('click', () => {
            const playerId = parseInt(item.dataset.playerId);
            toggleQuickSelect(playerId, item);
        });
    });
}

// Toggle player selection in Quick Select
function toggleQuickSelect(playerId, element) {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;
    
    const isCurrentlySelected = selectedPlayers.some(p => p.id === playerId);
    
    if (isCurrentlySelected) {
        // Remove from selection
        selectedPlayers = selectedPlayers.filter(p => p.id !== playerId);
        element.classList.remove('selected');
    } else {
        // Add to selection
        selectedPlayers.push(player);
        element.classList.add('selected');
    }
    
    updateQuickSelectCount();
    saveToLocalStorage();
}

// Update Quick Select Count
function updateQuickSelectCount() {
    quickSelectCount.textContent = `${selectedPlayers.length} selected`;
    selectedCountEl.textContent = selectedPlayers.length;
}
