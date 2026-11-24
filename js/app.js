/**
 * KhatibSmash Frontend Controller
 * Available globally as window.app (Supports English / Chinese i18n + Community Message Board)
 */

class App {
  constructor() {
    this.currentView = 'leaderboard';
    this.currentTournamentTab = 'results';
    this.players = [];
    this.tournaments = [];
    this.messages = [];
    this.activeTournament = null;
    this.ratingChart = null;
    this.replyTargetId = null;
  }

  async init() {
    this.applyLanguage();
    this.updateBackendBadge();
    await this.loadData();
    this.renderLeaderboard();
    this.initTournamentsSelect();
    this.initH2HSelect();
    await this.loadMessages();
  }

  setLanguage(lang) {
    if (window.i18n) {
      window.i18n.setLanguage(lang);
    }
  }

  applyLanguage() {
    const lang = window.i18n ? window.i18n.currentLang : 'en';

    const btnEn = document.getElementById('lang-btn-en');
    const btnCn = document.getElementById('lang-btn-cn');
    if (btnEn && btnCn) {
      if (lang === 'en') {
        btnEn.className = 'px-2.5 py-1 rounded-md transition-all text-teal-400 bg-teal-500/20 font-bold';
        btnCn.className = 'px-2.5 py-1 rounded-md transition-all text-slate-400 hover:text-white';
      } else {
        btnCn.className = 'px-2.5 py-1 rounded-md transition-all text-teal-400 bg-teal-500/20 font-bold';
        btnEn.className = 'px-2.5 py-1 rounded-md transition-all text-slate-400 hover:text-white';
      }
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && window.i18n) {
        el.textContent = window.i18n.t(key);
      }
    });

    const searchInput = document.getElementById('player-search');
    if (searchInput && window.i18n) {
      searchInput.placeholder = window.i18n.t('searchPlaceholder');
    }

    const nickInput = document.getElementById('msg-nickname');
    if (nickInput && window.i18n) {
      nickInput.placeholder = window.i18n.t('boardNicknamePlaceholder');
    }

    const msgContentInput = document.getElementById('msg-content');
    if (msgContentInput && window.i18n) {
      msgContentInput.placeholder = window.i18n.t('boardPlaceholder');
    }

    this.updateBackendBadge();
    if (this.players && this.players.length > 0) {
      this.renderLeaderboard();
      if (this.activeTournament) {
        this.renderTournamentResults();
        this.renderGroupMatrices();
        this.renderKnockoutBracket();
      }
      this.initH2HSelect();
      this.renderH2H();
      this.renderMessages();
    }
  }

  t(key) {
    return window.i18n ? window.i18n.t(key) : key;
  }

  updateBackendBadge() {
    const badge = document.getElementById('backend-status-badge');
    if (badge) {
      if (window.SupabaseConfig && window.SupabaseConfig.url && window.SupabaseConfig.anonKey) {
        badge.textContent = this.t('dataSourceSupabase');
        badge.className = 'text-emerald-400 font-semibold hidden sm:inline';
      } else {
        badge.textContent = this.t('dataSourceDemo');
        badge.className = 'text-slate-300 hidden sm:inline';
      }
    }
  }

  async loadData() {
    this.players = await window.db.getPlayers();
    this.tournaments = await window.db.getTournaments();
  }

  navigate(viewName) {
    this.currentView = viewName;
    if (window.GA_CONFIG) {
      window.GA_CONFIG.trackPageView(viewName);
    }
    ['leaderboard', 'tournaments', 'h2h', 'board'].forEach(v => {
      const el = document.getElementById(`view-${v}`);
      const btn = document.getElementById(`nav-${v}`);
      if (el) el.classList.toggle('hidden', v !== viewName);
      if (btn) {
        if (v === viewName) {
          btn.className = 'nav-btn px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 text-teal-400 bg-teal-500/10';
        } else {
          btn.className = 'nav-btn px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800';
        }
      }
    });

    if (viewName === 'tournaments' && !this.activeTournament && this.tournaments.length > 0) {
      this.changeTournament();
    } else if (viewName === 'h2h') {
      this.renderH2H();
    } else if (viewName === 'board') {
      this.renderMessages();
    }
  }

  // --- LEADERBOARD LOGIC ---
  renderLeaderboard(filterText = '') {
    const tbody = document.getElementById('leaderboard-tbody');
    const podiumContainer = document.getElementById('top-podium-cards');
    if (!tbody) return;

    let filtered = this.players;
    if (filterText) {
      const q = filterText.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.grip_style && p.grip_style.toLowerCase().includes(q)));
    }

    if (podiumContainer && !filterText) {
      const top3 = this.players.slice(0, 3);
      const badges = ['bg-amber-400/20 text-amber-300 border-amber-500/30', 'bg-slate-400/20 text-slate-300 border-slate-500/30', 'bg-amber-700/20 text-amber-500 border-amber-800/30'];
      const rankLabels = [this.t('podium1st'), this.t('podium2nd'), this.t('podium3rd')];

      podiumContainer.innerHTML = top3.map((p, idx) => `
        <div class="glass-card rounded-2xl p-5 border ${badges[idx]} flex items-center justify-between cursor-pointer hover:border-teal-400/50 transition" onclick="app.showPlayerProfile('${p.id}')">
          <div class="flex items-center space-x-3">
            <img src="${p.avatar_url}" alt="${p.name}" class="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 p-0.5">
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-slate-400">${rankLabels[idx]}</div>
              <div class="text-base font-bold text-white hover:text-teal-400">${p.name}</div>
              <div class="text-xs text-slate-400">${p.grip_style || 'All-round'}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xl font-extrabold text-teal-400">${p.current_rating}</div>
            <div class="text-xs text-slate-500">${this.t('colPeak')} ${p.peak_rating}</div>
          </div>
        </div>
      `).join('');
    }

    tbody.innerHTML = filtered.map((p, index) => {
      const winRate = p.total_matches > 0 ? Math.round((p.total_wins / p.total_matches) * 100) : 0;
      let rankBadge = `<span class="inline-block w-6 text-center text-slate-400 font-bold">${index + 1}</span>`;
      if (index === 0) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-bold text-xs shadow-md">1</span>`;
      if (index === 1) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold text-xs shadow-md">2</span>`;
      if (index === 2) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs shadow-md">3</span>`;

      const genderText = p.gender === 'M' ? this.t('genderMale') : this.t('genderFemale');

      return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="px-5 py-4 text-center">${rankBadge}</td>
          <td class="px-5 py-4">
            <div class="flex items-center space-x-3">
              <img src="${p.avatar_url}" class="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 p-0.5">
              <div>
                <a href="javascript:void(0)" onclick="app.showPlayerProfile('${p.id}')" class="text-white font-semibold hover:text-teal-400 transition">${p.name}</a>
                <span class="text-xs text-slate-500 block">${genderText}</span>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 text-center text-xs text-slate-300 hidden md:table-cell">${p.grip_style || 'N/A'}</td>
          <td class="px-5 py-4 text-center font-bold text-teal-400 text-base">${p.current_rating}</td>
          <td class="px-5 py-4 text-center text-xs text-slate-400 font-semibold">${p.peak_rating}</td>
          <td class="px-5 py-4 text-center text-xs text-slate-300">
            ${p.total_matches} <span class="text-emerald-400">(${p.total_wins}W</span> / <span class="text-rose-400">${p.total_losses}L)</span>
          </td>
          <td class="px-5 py-4 text-center">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${winRate >= 60 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300'}">
              ${winRate}%
            </div>
          </td>
          <td class="px-5 py-4 text-center">
            <button onclick="app.showPlayerProfile('${p.id}')" class="text-xs text-teal-400 hover:text-teal-300 font-medium px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 transition">
              ${this.t('btnProfile')}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  filterLeaderboard() {
    const input = document.getElementById('player-search');
    this.renderLeaderboard(input ? input.value : '');
  }

  // --- TOURNAMENTS LOGIC ---
  initTournamentsSelect() {
    const sel = document.getElementById('tournament-select');
    if (!sel) return;
    sel.innerHTML = this.tournaments.map(t => `
      <option value="${t.id}">${t.title}</option>
    `).join('');
  }

  async changeTournament() {
    const sel = document.getElementById('tournament-select');
    if (!sel) return;
    const tid = sel.value;
    const details = await window.db.getTournamentDetails(tid);
    this.activeTournament = details;

    const badge = document.getElementById('tournament-meta-badge');
    if (badge && details.tournament) {
      badge.innerHTML = `
        <span class="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          <i class="fa-regular fa-calendar mr-1"></i> ${details.tournament.tournament_date}
        </span>
        <span class="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          <i class="fa-solid fa-location-dot mr-1 text-rose-400"></i> ${details.tournament.location}
        </span>
        <span class="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
          <i class="fa-solid fa-check-double mr-1"></i> ${this.t('statusCompleted')}
        </span>
      `;
    }

    this.renderTournamentResults();
    this.renderGroupMatrices();
    this.renderKnockoutBracket();
  }

  setTournamentTab(tab) {
    this.currentTournamentTab = tab;
    ['results', 'groups', 'knockout'].forEach(t => {
      const el = document.getElementById(`subview-${t}`);
      const btn = document.getElementById(`ttab-${t}`);
      if (el) el.classList.toggle('hidden', t !== tab);
      if (btn) {
        if (t === tab) {
          btn.className = 'pb-3 border-b-2 border-teal-400 text-teal-400 flex items-center gap-2';
        } else {
          btn.className = 'pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2';
        }
      }
    });
  }

  renderTournamentResults() {
    const tbody = document.getElementById('tournament-results-tbody');
    if (!tbody || !this.activeTournament) return;

    const parts = [...this.activeTournament.participants].sort((a, b) => a.final_rank - b.final_rank);
    tbody.innerHTML = parts.map(p => {
      const playerObj = this.players.find(pl => pl.id === p.player_id) || { name: 'Player', avatar_url: '' };
      const changeClass = p.rating_change >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
      const changeSign = p.rating_change >= 0 ? `+${p.rating_change}` : `${p.rating_change}`;

      const rankBadge = p.final_rank <= 3
        ? `<span class="inline-block px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">${this.t('rankPrefix')}${p.final_rank}</span>`
        : `<span class="text-slate-400">${this.t('rankPrefix')}${p.final_rank}</span>`;

      return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="px-5 py-3.5 text-center font-bold">
            ${rankBadge}
          </td>
          <td class="px-5 py-3.5 flex items-center space-x-3">
            <img src="${playerObj.avatar_url}" class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700">
            <span class="text-white font-medium cursor-pointer hover:text-teal-400" onclick="app.showPlayerProfile('${p.player_id}')">${playerObj.name}</span>
          </td>
          <td class="px-5 py-3.5 text-center text-slate-400">${p.starting_rating}</td>
          <td class="px-5 py-3.5 text-center ${changeClass}">${changeSign}</td>
          <td class="px-5 py-3.5 text-center font-bold text-teal-400">${p.ending_rating}</td>
        </tr>
      `;
    }).join('');
  }

  renderGroupMatrices() {
    const container = document.getElementById('group-matrices-container');
    if (!container || !this.activeTournament) return;

    const groups = this.activeTournament.tournament.groups || ['Group A', 'Group B'];
    const groupMatches = (this.activeTournament.matches || []).filter(m => m.stage === 'group');

    container.innerHTML = groups.map(gName => {
      const matchesInGroup = groupMatches.filter(m => m.group_name === gName);
      const playerIds = new Set();
      matchesInGroup.forEach(m => {
        playerIds.add(m.player1_id);
        playerIds.add(m.player2_id);
      });
      const pList = Array.from(playerIds).map(id => this.players.find(p => p.id === id)).filter(Boolean);

      let headersHtml = pList.map((p, i) => `<th class="w-24">${i + 1}. ${p.name.split(' ')[0]}</th>`).join('');
      let rowsHtml = pList.map((rowP, rIdx) => {
        let wins = 0;
        let losses = 0;
        let setsWon = 0;
        let setsLost = 0;

        let cellsHtml = pList.map((colP, cIdx) => {
          if (rIdx === cIdx) {
            return `<td class="diagonal"></td>`;
          }
          const match = matchesInGroup.find(m => 
            (m.player1_id === rowP.id && m.player2_id === colP.id) ||
            (m.player1_id === colP.id && m.player2_id === rowP.id)
          );

          if (!match) return `<td class="text-slate-600">-</td>`;

          const isP1 = match.player1_id === rowP.id;
          const myScore = isP1 ? match.player1_score : match.player2_score;
          const opScore = isP1 ? match.player2_score : match.player1_score;

          setsWon += myScore;
          setsLost += opScore;
          if (myScore > opScore) wins++;
          else losses++;

          const isWin = myScore > opScore;
          return `
            <td class="text-center font-semibold ${isWin ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-400'}">
              ${myScore} : ${opScore}
              <div class="text-[10px] text-slate-500 font-normal">${match.set_scores || ''}</div>
            </td>
          `;
        }).join('');

        return `
          <tr>
            <td class="font-bold text-slate-300 text-left px-3">${rIdx + 1}. ${rowP.name}</td>
            ${cellsHtml}
            <td class="font-bold text-teal-400">${wins}W / ${losses}L</td>
            <td class="text-xs text-slate-400">${setsWon}-${setsLost}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div class="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
            <h4 class="font-bold text-white text-base flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-teal-400"></span> ${gName} ${this.t('matrixTitleSuffix')}
            </h4>
            <span class="text-xs text-slate-400">${this.t('matrixSub')}</span>
          </div>
          <div class="overflow-x-auto p-4">
            <table class="matrix-table text-sm">
              <thead>
                <tr>
                  <th class="text-left w-36 px-3">${this.t('matrixHeaderPlayer')}</th>
                  ${headersHtml}
                  <th class="w-24">${this.t('matrixHeaderRecord')}</th>
                  <th class="w-20">${this.t('matrixHeaderDiff')}</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');
  }

  renderKnockoutBracket() {
    const container = document.getElementById('knockout-bracket-container');
    if (!container || !this.activeTournament) return;

    const koMatches = (this.activeTournament.matches || []).filter(m => m.stage === 'knockout');
    
    container.innerHTML = `
      <div class="space-y-6">
        <h4 class="font-bold text-white text-base flex items-center gap-2">
          <i class="fa-solid fa-crown text-amber-400"></i> ${this.t('koTitle')}
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${koMatches.map(m => {
            const p1 = this.players.find(p => p.id === m.player1_id) || { name: 'TBD' };
            const p2 = this.players.find(p => p.id === m.player2_id) || { name: 'TBD' };
            const p1Won = m.winner_id === m.player1_id;
            const p2Won = m.winner_id === m.player2_id;

            let roundLabel = m.round_name || 'Knockout';
            if (this.t('colRank') === '排名') {
              if (roundLabel.includes('Semi-Final 1') || roundLabel.includes('半决赛 1')) roundLabel = '半决赛 1 (A1 vs B2)';
              else if (roundLabel.includes('Semi-Final 2') || roundLabel.includes('半决赛 2')) roundLabel = '半决赛 2 (B1 vs A2)';
              else if (roundLabel.includes('Bronze') || roundLabel.includes('季军')) roundLabel = '季军战 (A2 vs B2)';
              else if (roundLabel.includes('Grand Final') || roundLabel.includes('决赛')) roundLabel = '冠亚军决赛 (A1 vs B1)';
            } else {
              if (roundLabel.includes('半决赛 1')) roundLabel = 'Semi-Final 1 (A1 vs B2)';
              else if (roundLabel.includes('半决赛 2')) roundLabel = 'Semi-Final 2 (B1 vs A2)';
              else if (roundLabel.includes('季军')) roundLabel = 'Bronze Medal Match (A2 vs B2)';
              else if (roundLabel.includes('冠亚军')) roundLabel = 'Grand Final (A1 vs B1)';
            }

            return `
              <div class="glass-card p-4 rounded-xl border border-slate-700/80 hover:border-teal-500/40 transition">
                <div class="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
                  <span class="font-semibold text-teal-400">${roundLabel}</span>
                  <span>${this.t('koBestOf')}</span>
                </div>
                
                <div class="flex items-center justify-between p-2 rounded ${p1Won ? 'bg-teal-500/10 font-bold text-white' : 'text-slate-400'}">
                  <span class="truncate">${p1.name}</span>
                  <span class="text-base ${p1Won ? 'text-teal-400' : 'text-slate-500'}">${m.player1_score}</span>
                </div>

                <div class="flex items-center justify-between p-2 rounded mt-1 ${p2Won ? 'bg-teal-500/10 font-bold text-white' : 'text-slate-400'}">
                  <span class="truncate">${p2.name}</span>
                  <span class="text-base ${p2Won ? 'text-teal-400' : 'text-slate-500'}">${m.player2_score}</span>
                </div>

                <div class="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-500 text-center">
                  ${this.t('koSetScores')}: ${m.set_scores}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --- HEAD TO HEAD (H2H) LOGIC ---
  initH2HSelect() {
    const sel1 = document.getElementById('h2h-player-1');
    const sel2 = document.getElementById('h2h-player-2');
    if (!sel1 || !sel2) return;

    const unit = this.t('colRank') === '排名' ? '分' : 'pts';
    const opts = this.players.map(p => `<option value="${p.id}">${p.name} (${p.current_rating} ${unit})</option>`).join('');
    sel1.innerHTML = opts;
    sel2.innerHTML = opts;

    if (this.players.length >= 2) {
      sel1.selectedIndex = 0;
      sel2.selectedIndex = 1;
    }
  }

  async renderH2H() {
    const p1Id = document.getElementById('h2h-player-1')?.value;
    const p2Id = document.getElementById('h2h-player-2')?.value;
    const container = document.getElementById('h2h-result-container');
    if (!container || !p1Id || !p2Id) return;

    if (p1Id === p2Id) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-500 glass-card rounded-2xl">
          ${this.t('h2hSelectDiff')}
        </div>
      `;
      return;
    }

    const p1 = this.players.find(p => p.id === p1Id);
    const p2 = this.players.find(p => p.id === p2Id);
    const h2h = await window.db.getHeadToHead(p1Id, p2Id);

    const p1WinRate = h2h.total > 0 ? Math.round((h2h.p1Wins / h2h.total) * 100) : 0;
    const p2WinRate = h2h.total > 0 ? 100 - p1WinRate : 0;

    container.innerHTML = `
      <div class="glass-card rounded-2xl p-6 border border-slate-800">
        <div class="grid grid-cols-3 items-center text-center">
          <div class="space-y-2">
            <img src="${p1.avatar_url}" class="w-16 h-16 rounded-full mx-auto bg-slate-800 border-2 border-teal-500/50">
            <div class="font-bold text-white text-lg">${p1.name}</div>
            <div class="text-xs text-slate-400">${p1.grip_style || 'All-round'}</div>
            <div class="text-sm font-semibold text-teal-400">${this.t('colRating')}: ${p1.current_rating}</div>
          </div>

          <div>
            <div class="text-4xl sm:text-5xl font-black text-white tracking-wider flex items-center justify-center gap-4">
              <span class="text-teal-400">${h2h.p1Wins}</span>
              <span class="text-slate-600">:</span>
              <span class="text-emerald-400">${h2h.p2Wins}</span>
            </div>
            <div class="text-xs text-slate-400 mt-2 font-medium">${h2h.total} ${this.t('h2hTotalEncounters')}</div>

            <div class="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden flex">
              <div class="bg-teal-500 h-full transition-all" style="width: ${p1WinRate}%"></div>
              <div class="bg-emerald-500 h-full transition-all" style="width: ${p2WinRate}%"></div>
            </div>
          </div>

          <div class="space-y-2">
            <img src="${p2.avatar_url}" class="w-16 h-16 rounded-full mx-auto bg-slate-800 border-2 border-emerald-500/50">
            <div class="font-bold text-white text-lg">${p2.name}</div>
            <div class="text-xs text-slate-400">${p2.grip_style || 'All-round'}</div>
            <div class="text-sm font-semibold text-emerald-400">${this.t('colRating')}: ${p2.current_rating}</div>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div class="p-4 bg-slate-800/80 border-b border-slate-700/80 font-bold text-white flex items-center justify-between">
          <span>${this.t('h2hMatchesTitle')}</span>
          <span class="text-xs text-slate-400">${h2h.matches.length} ${this.t('h2hTotalEncounters')}</span>
        </div>
        <div class="divide-y divide-slate-800/60">
          ${h2h.matches.length === 0 ? `
            <div class="p-8 text-center text-slate-500 text-sm">${this.t('h2hNoMatches')}</div>
          ` : h2h.matches.map(m => {
            const isP1Winner = m.winner_id === p1Id;
            return `
              <div class="p-4 hover:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div>
                  <div class="font-semibold text-white flex items-center gap-2">
                    <span>${m.tournament_title || 'Tournament Match'}</span>
                    <span class="text-xs text-teal-400 px-2 py-0.5 rounded bg-teal-500/10">${m.round_name}</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">${m.tournament_date || ''} · ${this.t('koSetScores')}: ${m.set_scores}</div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-bold text-base ${isP1Winner ? 'text-teal-400' : 'text-slate-400'}">${p1.name.split(' ')[0]} ${m.player1_id === p1Id ? m.player1_score : m.player2_score}</span>
                  <span class="text-slate-600">-</span>
                  <span class="font-bold text-base ${!isP1Winner ? 'text-emerald-400' : 'text-slate-400'}">${m.player1_id === p2Id ? m.player1_score : m.player2_score} ${p2.name.split(' ')[0]}</span>
                  <span class="text-xs px-2 py-0.5 rounded font-semibold ${isP1Winner ? 'bg-teal-500/20 text-teal-300' : 'bg-emerald-500/20 text-emerald-300'}">
                    ${isP1Winner ? `${p1.name.split(' ')[0]} ${this.t('h2hWon')}` : `${p2.name.split(' ')[0]} ${this.t('h2hWon')}`}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --- COMMUNITY MESSAGE BOARD LOGIC ---
  async loadMessages() {
    this.messages = await window.db.getMessages();
  }

  renderMessages() {
    const container = document.getElementById('board-messages-container');
    if (!container) return;

    if (!this.messages || this.messages.length === 0) {
      container.innerHTML = `
        <div class="glass-card rounded-2xl p-8 text-center text-slate-500 text-sm">
          ${this.t('noMessagesYet')}
        </div>
      `;
      return;
    }

    // Top-level posts
    const topPosts = this.messages.filter(m => !m.parent_id);
    const replies = this.messages.filter(m => m.parent_id);

    container.innerHTML = topPosts.map(post => {
      const postReplies = replies.filter(r => r.parent_id === post.id);
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${post.avatar_seed || post.author_name}`;
      const timeStr = new Date(post.created_at).toLocaleString();

      return `
        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <!-- Main Post -->
          <div class="flex items-start space-x-3.5">
            <img src="${avatarUrl}" class="w-10 h-10 rounded-full bg-slate-800 border border-teal-500/40 p-0.5 shrink-0">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="font-bold text-white text-sm">${this.escapeHtml(post.author_name)}</div>
                <div class="text-[11px] text-slate-500">${timeStr}</div>
              </div>
              <p class="text-slate-200 text-sm mt-1 whitespace-pre-wrap leading-relaxed">${this.escapeHtml(post.content)}</p>

              <!-- Actions -->
              <div class="flex items-center gap-4 mt-3 text-xs">
                <button onclick="app.likeMessage('${post.id}')" class="text-slate-400 hover:text-rose-400 transition flex items-center gap-1.5">
                  <i class="fa-regular fa-heart"></i>
                  <span>${post.likes || 0}</span>
                </button>
                <button onclick="app.setReplyTarget('${post.id}', '${this.escapeHtml(post.author_name)}')" class="text-teal-400 hover:text-teal-300 transition flex items-center gap-1 font-semibold">
                  <i class="fa-solid fa-reply"></i>
                  <span>${this.t('btnReply')}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Threaded Replies -->
          ${postReplies.length > 0 ? `
            <div class="ml-10 pt-3 border-t border-slate-800/80 space-y-3">
              ${postReplies.map(r => {
                const rAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${r.avatar_seed || r.author_name}`;
                const rTime = new Date(r.created_at).toLocaleString();
                return `
                  <div class="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <img src="${rAvatar}" class="w-7 h-7 rounded-full bg-slate-800 border border-emerald-500/40 p-0.5 shrink-0">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <div class="font-semibold text-white text-xs">${this.escapeHtml(r.author_name)}</div>
                        <div class="text-[10px] text-slate-500">${rTime}</div>
                      </div>
                      <p class="text-slate-300 text-xs mt-1 whitespace-pre-wrap leading-relaxed">${this.escapeHtml(r.content)}</p>
                      <div class="flex items-center gap-3 mt-2 text-[11px]">
                        <button onclick="app.likeMessage('${r.id}')" class="text-slate-400 hover:text-rose-400 transition flex items-center gap-1">
                          <i class="fa-regular fa-heart"></i>
                          <span>${r.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  setReplyTarget(id, author) {
    this.replyTargetId = id;
    const indicator = document.getElementById('reply-target-indicator');
    const authorSpan = document.getElementById('reply-target-author');
    if (indicator && authorSpan) {
      authorSpan.textContent = author;
      indicator.classList.remove('hidden');
      indicator.classList.add('flex');
    }
    const input = document.getElementById('msg-content');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cancelReply() {
    this.replyTargetId = null;
    const indicator = document.getElementById('reply-target-indicator');
    if (indicator) {
      indicator.classList.add('hidden');
      indicator.classList.remove('flex');
    }
  }

  async submitMessage() {
    const nickInput = document.getElementById('msg-nickname');
    const contentInput = document.getElementById('msg-content');
    if (!contentInput) return;

    const content = contentInput.value.trim();
    if (!content) return;

    const nickname = nickInput ? nickInput.value.trim() : '';
    await window.db.addMessage(nickname, content, this.replyTargetId);

    contentInput.value = '';
    this.cancelReply();
    await this.loadMessages();
    this.renderMessages();
  }

  async likeMessage(id) {
    await window.db.likeMessage(id);
    await this.loadMessages();
    this.renderMessages();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // --- PLAYER PROFILE & RATING CHART MODAL ---
  async showPlayerProfile(playerId) {
    const modal = document.getElementById('player-profile-modal');
    const content = document.getElementById('player-modal-content');
    if (!modal || !content) return;

    const p = this.players.find(item => item.id === playerId);
    if (!p) return;

    const history = await window.db.getPlayerHistory(playerId);
    const winRate = p.total_matches > 0 ? Math.round((p.total_wins / p.total_matches) * 100) : 0;
    const genderText = p.gender === 'M' ? this.t('genderMale') : this.t('genderFemale');

    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center space-x-4">
          <img src="${p.avatar_url}" class="w-16 h-16 rounded-full bg-slate-800 border-2 border-teal-400">
          <div>
            <h3 class="text-2xl font-bold text-white">${p.name}</h3>
            <p class="text-xs text-slate-400 mt-0.5">${this.t('styleLabel')}: <span class="text-slate-200">${p.grip_style || 'All-round'}</span> · ${genderText}</p>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-3 text-center">
          <div class="glass-card p-3 rounded-xl border border-slate-700">
            <div class="text-xs text-slate-400">${this.t('currentRating')}</div>
            <div class="text-xl font-extrabold text-teal-400">${p.current_rating}</div>
          </div>
          <div class="glass-card p-3 rounded-xl border border-slate-700">
            <div class="text-xs text-slate-400">${this.t('peakRating')}</div>
            <div class="text-xl font-extrabold text-amber-400">${p.peak_rating}</div>
          </div>
          <div class="glass-card p-3 rounded-xl border border-slate-700">
            <div class="text-xs text-slate-400">${this.t('totalMatches')}</div>
            <div class="text-xl font-extrabold text-white">${p.total_matches}</div>
          </div>
          <div class="glass-card p-3 rounded-xl border border-slate-700">
            <div class="text-xs text-slate-400">${this.t('winRate')}</div>
            <div class="text-xl font-extrabold text-emerald-400">${winRate}%</div>
          </div>
        </div>

        <div class="glass-card p-4 rounded-xl border border-slate-800">
          <h4 class="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <i class="fa-solid fa-chart-line text-teal-400"></i> ${this.t('chartTitle')}
          </h4>
          <div class="h-48 w-full">
            <canvas id="player-rating-chart"></canvas>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-semibold text-slate-400 uppercase mb-3">${this.t('recentMatchesTitle')}</h4>
          <div class="divide-y divide-slate-800/60 max-h-48 overflow-y-auto">
            ${history.matches.length === 0 ? `<div class="text-xs text-slate-500 py-3">${this.t('noRecentMatches')}</div>` : history.matches.slice(0, 8).map(m => {
              const isWinner = m.winner_id === p.id;
              const opId = m.player1_id === p.id ? m.player2_id : m.player1_id;
              const op = this.players.find(pl => pl.id === opId) || { name: 'Opponent' };
              const myScore = m.player1_id === p.id ? m.player1_score : m.player2_score;
              const opScore = m.player1_id === p.id ? m.player2_score : m.player1_score;

              return `
                <div class="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span class="font-semibold text-white">${m.tournament_title}</span>
                    <span class="text-slate-400 ml-1">vs ${op.name} (${m.round_name})</span>
                    <div class="text-[10px] text-slate-500">${this.t('koSetScores')}: ${m.set_scores}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold ${isWinner ? 'text-teal-400' : 'text-slate-400'}">${myScore} : ${opScore}</span>
                    <span class="px-2 py-0.5 rounded font-bold ${isWinner ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                      ${isWinner ? (this.t('colRank') === '排名' ? '胜' : 'W') : (this.t('colRank') === '排名' ? '负' : 'L')}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    setTimeout(() => {
      const canvas = document.getElementById('player-rating-chart');
      if (!canvas) return;

      if (this.ratingChart) {
        this.ratingChart.destroy();
      }

      let chartPoints = history.ratingHistory.map(h => ({ x: h.date, y: h.new_rating }));
      if (chartPoints.length < 2) {
        chartPoints = [
          { x: '2026-08', y: p.initial_rating },
          { x: '2026-09', y: p.initial_rating + 25 },
          { x: '2026-10', y: p.peak_rating - 15 },
          { x: '2026-11', y: p.current_rating }
        ];
      }

      this.ratingChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: chartPoints.map(pt => pt.x),
          datasets: [{
            label: this.t('colRating'),
            data: chartPoints.map(pt => pt.y),
            borderColor: '#14b8a6',
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#14b8a6',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8', font: { size: 10 } }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8', font: { size: 10 } }
            }
          }
        }
      });
    }, 50);
  }

  closePlayerModal() {
    const modal = document.getElementById('player-profile-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  // --- SETTINGS MODAL LOGIC ---
  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const uInput = document.getElementById('cfg-sb-url');
    const kInput = document.getElementById('cfg-sb-key');
    const gaInput = document.getElementById('cfg-ga-id');
    if (uInput) uInput.value = localStorage.getItem('khatib_sb_url') || '';
    if (kInput) kInput.value = localStorage.getItem('khatib_sb_key') || '';
    if (gaInput) gaInput.value = localStorage.getItem('khatib_ga_id') || '';
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  saveSupabaseConfig() {
    const url = document.getElementById('cfg-sb-url')?.value.trim();
    const key = document.getElementById('cfg-sb-key')?.value.trim();
    const gaId = document.getElementById('cfg-ga-id')?.value.trim();

    if (url && key) {
      localStorage.setItem('khatib_sb_url', url);
      localStorage.setItem('khatib_sb_key', key);
    }
    if (window.GA_CONFIG) {
      window.GA_CONFIG.setMeasurementId(gaId);
    }
    this.closeSettingsModal();
    window.location.reload();
  }

  clearSupabaseConfig() {
    localStorage.removeItem('khatib_sb_url');
    localStorage.removeItem('khatib_sb_key');
    localStorage.removeItem('khatib_ga_id');
    this.closeSettingsModal();
    window.location.reload();
  }
}

window.app = new App();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
