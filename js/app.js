/**
 * KhatibSmash Frontend Controller
 * Available globally as window.app
 */

class App {
  constructor() {
    this.currentView = 'leaderboard';
    this.currentTournamentTab = 'results';
    this.players = [];
    this.tournaments = [];
    this.activeTournament = null;
    this.ratingChart = null;
  }

  async init() {
    this.updateBackendBadge();
    await this.loadData();
    this.renderLeaderboard();
    this.initTournamentsSelect();
    this.initH2HSelect();
  }

  updateBackendBadge() {
    const badge = document.getElementById('backend-status-badge');
    if (badge) {
      if (window.SupabaseConfig && window.SupabaseConfig.url && window.SupabaseConfig.anonKey) {
        badge.textContent = '数据源: Supabase 云数据库';
        badge.className = 'text-emerald-400 font-semibold';
      } else {
        badge.textContent = '数据源: 演示数据 (点击配置)';
        badge.className = 'text-slate-300';
      }
    }
  }

  async loadData() {
    this.players = await window.db.getPlayers();
    this.tournaments = await window.db.getTournaments();
  }

  navigate(viewName) {
    this.currentView = viewName;
    ['leaderboard', 'tournaments', 'h2h'].forEach(v => {
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
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.grip_style.toLowerCase().includes(q));
    }

    // Top 3 Podium
    if (podiumContainer && !filterText) {
      const top3 = this.players.slice(0, 3);
      const badges = ['bg-amber-400/20 text-amber-300 border-amber-500/30', 'bg-slate-400/20 text-slate-300 border-slate-500/30', 'bg-amber-700/20 text-amber-500 border-amber-800/30'];
      const rankLabels = ['冠军 No.1', '亚军 No.2', '季军 No.3'];

      podiumContainer.innerHTML = top3.map((p, idx) => `
        <div class="glass-card rounded-2xl p-5 border ${badges[idx]} flex items-center justify-between cursor-pointer hover:border-teal-400/50 transition" onclick="app.showPlayerProfile('${p.id}')">
          <div class="flex items-center space-x-3">
            <img src="${p.avatar_url}" alt="${p.name}" class="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 p-0.5">
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-slate-400">${rankLabels[idx]}</div>
              <div class="text-base font-bold text-white hover:text-teal-400">${p.name}</div>
              <div class="text-xs text-slate-400">${p.grip_style}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xl font-extrabold text-teal-400">${p.current_rating}</div>
            <div class="text-xs text-slate-500">最高 ${p.peak_rating}</div>
          </div>
        </div>
      `).join('');
    }

    // Table rows
    tbody.innerHTML = filtered.map((p, index) => {
      const winRate = p.total_matches > 0 ? Math.round((p.total_wins / p.total_matches) * 100) : 0;
      let rankBadge = `<span class="inline-block w-6 text-center text-slate-400 font-bold">${index + 1}</span>`;
      if (index === 0) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-bold text-xs shadow-md">1</span>`;
      if (index === 1) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold text-xs shadow-md">2</span>`;
      if (index === 2) rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs shadow-md">3</span>`;

      return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="px-5 py-4 text-center">${rankBadge}</td>
          <td class="px-5 py-4">
            <div class="flex items-center space-x-3">
              <img src="${p.avatar_url}" class="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 p-0.5">
              <div>
                <a href="javascript:void(0)" onclick="app.showPlayerProfile('${p.id}')" class="text-white font-semibold hover:text-teal-400 transition">${p.name}</a>
                <span class="text-xs text-slate-500 block">${p.gender === 'M' ? '男' : '女'}</span>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 text-center text-xs text-slate-300 hidden md:table-cell">${p.grip_style}</td>
          <td class="px-5 py-4 text-center font-bold text-teal-400 text-base">${p.current_rating}</td>
          <td class="px-5 py-4 text-center text-xs text-slate-400 font-semibold">${p.peak_rating}</td>
          <td class="px-5 py-4 text-center text-xs text-slate-300">
            ${p.total_matches} 场 <span class="text-emerald-400">(${p.total_wins}胜</span> / <span class="text-rose-400">${p.total_losses}负)</span>
          </td>
          <td class="px-5 py-4 text-center">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${winRate >= 60 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300'}">
              ${winRate}%
            </div>
          </td>
          <td class="px-5 py-4 text-center">
            <button onclick="app.showPlayerProfile('${p.id}')" class="text-xs text-teal-400 hover:text-teal-300 font-medium px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 transition">
              战绩档案
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
          <i class="fa-solid fa-check-double mr-1"></i> 已完赛
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
      const playerObj = this.players.find(pl => pl.id === p.player_id) || { name: '选手', avatar_url: '' };
      const changeClass = p.rating_change >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
      const changeSign = p.rating_change >= 0 ? `+${p.rating_change}` : `${p.rating_change}`;

      return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="px-5 py-3.5 text-center font-bold">
            ${p.final_rank <= 3 ? `<span class="inline-block px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">第 ${p.final_rank} 名</span>` : `<span class="text-slate-400">第 ${p.final_rank} 名</span>`}
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

    const groups = this.activeTournament.tournament.groups || ['A组', 'B组'];
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
            <td class="font-bold text-teal-400">${wins}胜 / ${losses}负</td>
            <td class="text-xs text-slate-400">${setsWon}-${setsLost}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div class="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
            <h4 class="font-bold text-white text-base flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-teal-400"></span> ${gName} 循环对阵及积分矩阵
            </h4>
            <span class="text-xs text-slate-400">前两名出线进入淘汰赛</span>
          </div>
          <div class="overflow-x-auto p-4">
            <table class="matrix-table text-sm">
              <thead>
                <tr>
                  <th class="text-left w-36 px-3">选手 \\ 对阵</th>
                  ${headersHtml}
                  <th class="w-24">胜负场次</th>
                  <th class="w-20">净胜局</th>
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
          <i class="fa-solid fa-crown text-amber-400"></i> 淘汰赛阶段对阵与比分
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${koMatches.map(m => {
            const p1 = this.players.find(p => p.id === m.player1_id) || { name: '待定' };
            const p2 = this.players.find(p => p.id === m.player2_id) || { name: '待定' };
            const p1Won = m.winner_id === m.player1_id;
            const p2Won = m.winner_id === m.player2_id;

            return `
              <div class="glass-card p-4 rounded-xl border border-slate-700/80 hover:border-teal-500/40 transition">
                <div class="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
                  <span class="font-semibold text-teal-400">${m.round_name}</span>
                  <span>5局3胜 (11分制)</span>
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
                  局分: ${m.set_scores}
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

    const opts = this.players.map(p => `<option value="${p.id}">${p.name} (${p.current_rating}分)</option>`).join('');
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
          请选择两位不同的选手进行交锋战绩对比。
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
            <div class="text-xs text-slate-400">${p1.grip_style}</div>
            <div class="text-sm font-semibold text-teal-400">积分: ${p1.current_rating}</div>
          </div>

          <div>
            <div class="text-4xl sm:text-5xl font-black text-white tracking-wider flex items-center justify-center gap-4">
              <span class="text-teal-400">${h2h.p1Wins}</span>
              <span class="text-slate-600">:</span>
              <span class="text-emerald-400">${h2h.p2Wins}</span>
            </div>
            <div class="text-xs text-slate-400 mt-2 font-medium">总计交手 ${h2h.total} 场</div>

            <div class="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden flex">
              <div class="bg-teal-500 h-full transition-all" style="width: ${p1WinRate}%"></div>
              <div class="bg-emerald-500 h-full transition-all" style="width: ${p2WinRate}%"></div>
            </div>
          </div>

          <div class="space-y-2">
            <img src="${p2.avatar_url}" class="w-16 h-16 rounded-full mx-auto bg-slate-800 border-2 border-emerald-500/50">
            <div class="font-bold text-white text-lg">${p2.name}</div>
            <div class="text-xs text-slate-400">${p2.grip_style}</div>
            <div class="text-sm font-semibold text-emerald-400">积分: ${p2.current_rating}</div>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div class="p-4 bg-slate-800/80 border-b border-slate-700/80 font-bold text-white flex items-center justify-between">
          <span>历史交战记录明细</span>
          <span class="text-xs text-slate-400">${h2h.matches.length} 次交锋</span>
        </div>
        <div class="divide-y divide-slate-800/60">
          ${h2h.matches.length === 0 ? `
            <div class="p-8 text-center text-slate-500 text-sm">两位选手暂无正式交战记录</div>
          ` : h2h.matches.map(m => {
            const isP1Winner = m.winner_id === p1Id;
            return `
              <div class="p-4 hover:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div>
                  <div class="font-semibold text-white flex items-center gap-2">
                    <span>${m.tournament_title || '积分赛'}</span>
                    <span class="text-xs text-teal-400 px-2 py-0.5 rounded bg-teal-500/10">${m.round_name}</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">${m.tournament_date || ''} · 详细局分: ${m.set_scores}</div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-bold text-base ${isP1Winner ? 'text-teal-400' : 'text-slate-400'}">${p1.name.split(' ')[0]} ${m.player1_id === p1Id ? m.player1_score : m.player2_score}</span>
                  <span class="text-slate-600">-</span>
                  <span class="font-bold text-base ${!isP1Winner ? 'text-emerald-400' : 'text-slate-400'}">${m.player1_id === p2Id ? m.player1_score : m.player2_score} ${p2.name.split(' ')[0]}</span>
                  <span class="text-xs px-2 py-0.5 rounded font-semibold ${isP1Winner ? 'bg-teal-500/20 text-teal-300' : 'bg-emerald-500/20 text-emerald-300'}">
                    ${isP1Winner ? `${p1.name.split(' ')[0]} 胜` : `${p2.name.split(' ')[0]} 胜`}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
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

    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center space-x-4">
          <img src="${p.avatar_url}" class="w-16 h-16 rounded-full bg-slate-800 border-2 border-teal-400">
          <div>
            <h3 class="text-2xl font-bold text-white">${p.name}</h3>
            <p class="text-xs text-slate-400 mt-0.5">打法风格: <span class="text-slate-200">${p.grip_style}</span> · ${p.gender === 'M' ? '男' : '女'}</p>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-3 text-center">
          <div class="glass-card p-3 rounded-xl border border-slate-700">
            <div class="text-xs text-slate-400">当前积分</div>
            <div class="text-xl font-extrabold text-teal-400">${p.current_rating}</div>
          </div>
          <div class="glass-card p-3 rounded-xl border border-slate-700">
            <div class="text-xs text-slate-400">历史最高</div>
            <div class="text-xl font-extrabold text-amber-400">${p.peak_rating}</div>
          </div>
          <div class="glass-card p-3 rounded-xl border border-slate-700">
            <div class="text-xs text-slate-400">参赛总场次</div>
            <div class="text-xl font-extrabold text-white">${p.total_matches}</div>
          </div>
          <div class="glass-card p-3 rounded-xl border border-slate-700">
            <div class="text-xs text-slate-400">生涯胜率</div>
            <div class="text-xl font-extrabold text-emerald-400">${winRate}%</div>
          </div>
        </div>

        <div class="glass-card p-4 rounded-xl border border-slate-800">
          <h4 class="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <i class="fa-solid fa-chart-line text-teal-400"></i> 历史积分演变走势
          </h4>
          <div class="h-48 w-full">
            <canvas id="player-rating-chart"></canvas>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-semibold text-slate-400 uppercase mb-3">最近比赛战绩记录</h4>
          <div class="divide-y divide-slate-800/60 max-h-48 overflow-y-auto">
            ${history.matches.length === 0 ? '<div class="text-xs text-slate-500 py-3">暂无比赛对阵</div>' : history.matches.slice(0, 8).map(m => {
              const isWinner = m.winner_id === p.id;
              const opId = m.player1_id === p.id ? m.player2_id : m.player1_id;
              const op = this.players.find(pl => pl.id === opId) || { name: '对手' };
              const myScore = m.player1_id === p.id ? m.player1_score : m.player2_score;
              const opScore = m.player1_id === p.id ? m.player2_score : m.player1_score;

              return `
                <div class="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span class="font-semibold text-white">${m.tournament_title}</span>
                    <span class="text-slate-400 ml-1">vs ${op.name} (${m.round_name})</span>
                    <div class="text-[10px] text-slate-500">小分: ${m.set_scores}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold ${isWinner ? 'text-teal-400' : 'text-slate-400'}">${myScore} : ${opScore}</span>
                    <span class="px-2 py-0.5 rounded font-bold ${isWinner ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                      ${isWinner ? '胜' : '负'}
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
            label: '积分 (Rating)',
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
    if (uInput) uInput.value = localStorage.getItem('khatib_sb_url') || '';
    if (kInput) kInput.value = localStorage.getItem('khatib_sb_key') || '';
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
    if (url && key) {
      localStorage.setItem('khatib_sb_url', url);
      localStorage.setItem('khatib_sb_key', key);
    }
    this.closeSettingsModal();
    window.location.reload();
  }

  clearSupabaseConfig() {
    localStorage.removeItem('khatib_sb_url');
    localStorage.removeItem('khatib_sb_key');
    this.closeSettingsModal();
    window.location.reload();
  }
}

window.app = new App();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
