/**
 * Multi-language (i18n) Translations for KhatibSmash
 * Available globally as window.i18n
 */

window.i18n = {
  detectDefaultLang() {
    const saved = localStorage.getItem('khatib_lang');
    if (saved) return saved;

    const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (navLang.startsWith('zh')) {
      return 'cn';
    }
    return 'en';
  },

  currentLang: null, // will be initialized below

  translations: {
    en: {
      appTitle: "KhatibSmash",
      appSubtitle: "Table Tennis Rating League",
      navLeaderboard: "Leaderboard",
      navTournaments: "Tournaments & Brackets",
      navH2H: "Head to Head",
      navBoard: "Message Board",
      dataSourceDemo: "Source: Demo Data",
      dataSourceSupabase: "Source: Supabase Cloud",
      dataSourceBtn: "Data Source",

      // Leaderboard
      badgeOfficial: "Official Community Standings",
      lbTitle: "Khatib Table Tennis Community Leaderboard",
      lbSubtitle: "USATT / Kaiqiu Rating System · Dynamic Match-by-Match Exchange · Real Skill Reflection",
      searchPlaceholder: "Search player name / style...",
      podium1st: "Champion (1st)",
      podium2nd: "Runner-up (2nd)",
      podium3rd: "3rd Place",
      colRank: "Rank",
      colPlayer: "Player",
      colStyle: "Play Style",
      colRating: "Rating",
      colPeak: "Peak",
      colMatches: "Matches (W/L)",
      colWinRate: "Win Rate",
      colAction: "Action",
      btnProfile: "Profile",

      // Tournaments
      selectEdition: "Select Tournament Edition",
      tabStandings: "Standings & Rating Deltas",
      tabGroups: "Group Stage Matrix",
      tabKnockout: "Knockout Bracket",
      statusCompleted: "Completed",
      finalResultsTitle: "Final Tournament Standings & Rating Settlement",
      finalResultsSub: "USATT Formula Settled",
      colPlace: "Place",
      colInitialRating: "Initial Rating",
      colRatingChange: "Change (Δ)",
      colNewRating: "New Rating",
      rankPrefix: "Rank #",
      matrixTitleSuffix: "Round Robin Matrix",
      matrixSub: "Top 2 advance to knockout stage",
      matrixHeaderPlayer: "Player \\ Match",
      matrixHeaderRecord: "Record",
      matrixHeaderDiff: "Sets +/-",
      koTitle: "Knockout Stage Matches & Scores",
      koBestOf: "Best of 5 (11-pt)",
      koSetScores: "Set Scores",

      // Head to Head
      h2hTitle: "Head-to-Head Player History (H2H)",
      h2hSubtitle: "Select any two players to view all-time match results, set scores, win percentages, and rating exchanges.",
      h2hPlayerA: "Player A",
      h2hPlayerB: "Player B",
      h2hVs: "VS",
      h2hTotalEncounters: "Total Encounters",
      h2hSelectDiff: "Please select two different players for head-to-head comparison.",
      h2hMatchesTitle: "Match History Details",
      h2hNoMatches: "No official match encounters recorded yet.",
      h2hWon: "Won",

      // Message Board
      boardTitle: "Community Message Board",
      boardSubtitle: "Share tips, match feedback, arrange practice sessions, or chat anonymously with fellow players.",
      boardPlaceholder: "Write a message or start a discussion...",
      boardNicknamePlaceholder: "Nickname (optional, defaults to Anonymous)",
      btnPostMessage: "Post Message",
      btnReply: "Reply",
      btnLike: "Like",
      replyingTo: "Replying to",
      cancelReply: "Cancel",
      noMessagesYet: "No messages yet. Be the first to start a conversation!",

      // Player Profile Modal
      currentRating: "Current Rating",
      peakRating: "Peak Rating",
      totalMatches: "Total Matches",
      winRate: "Win Rate",
      chartTitle: "Rating Progression Curve",
      recentMatchesTitle: "Recent Match Records",
      noRecentMatches: "No recent matches recorded.",
      styleLabel: "Style",
      genderMale: "Male",
      genderFemale: "Female",

      // Notice / Contact Modal (EN)
      noticeBtn: "Notice & Join",
      noticeTitle: "Club Notice & Contact Info",
      noticeJoinTitle: "Interested in joining our club / tournaments?",
      noticeJoinDesc: "We welcome table tennis enthusiasts of all skill levels! To register for monthly leagues, join casual practice sessions, or join our community WhatsApp group:",
      noticeContactPerson: "Contact Person",
      noticePhone: "Phone / Mobile",
      noticeWhatsappGroup: "WhatsApp Community Group",
      noticeJoinWhatsappBtn: "Join WhatsApp Group",
      noticeCorrectionTitle: "Data Amendment & Admin Support",
      noticeCorrectionDesc: "If any match score, player rating, or name is inaccurate and needs correction, please leave a message on the Message Board or directly reach out to the system administrator.",
      noticeAdminContact: "System Admin Contact",
      noticeRulesTitle: "Rating Calculation Rules (Kaiqiu / USATT)",
      noticeRulesDesc: "Points exchanged after each match depend on the pre-match rating gap between the two players:",
      noticeRulesEqual: "Equal / close rating (gap 0–12 pts): Winner +8 / Loser -8.",
      noticeRulesHigher: "Expected win (higher rated wins): Smaller gain (+7 down to +1). Gap ≥213 pts gains 0.",
      noticeRulesUpset: "Upset win (underdog wins): Substantial bonus (+10 up to +50 pts max).",
      noticeRulesDiffCol: "Rating Difference",
      noticeRulesHigherCol: "Higher Wins",
      noticeRulesUpsetCol: "Upset (Lower Wins)",
      noticeRulesTip: "Every match is zero-sum: winner's gain equals loser's deduction.",
      noticeCloseBtn: "Got it",
      settingsTitle: "Supabase Database Settings",
      settingsDesc: "Enter your Supabase Project URL and Public Anon Key below. Leaving these blank will use local demo data.",
      projUrlLabel: "Project URL",
      anonKeyLabel: "Anon / Public Key",
      btnResetDemo: "Use Demo Mode",
      btnSaveConnect: "Save & Connect"
    },

    cn: {
      appTitle: "KhatibSmash",
      appSubtitle: "开球网积分赛系统",
      navLeaderboard: "总积分榜",
      navTournaments: "赛事成绩 & 对阵",
      navH2H: "H2H 历史交手",
      navBoard: "球友留言板",
      dataSourceDemo: "数据源: 演示数据",
      dataSourceSupabase: "数据源: Supabase 云端",
      dataSourceBtn: "数据源设置",

      // Leaderboard
      badgeOfficial: "官方实时积分",
      lbTitle: "Khatib 球友会社区积分总榜",
      lbSubtitle: "开球网/USATT标准积分体系 · 胜负动态计分 · 真实反应球友水平",
      searchPlaceholder: "搜索选手姓名 / 打法...",
      podium1st: "冠军 No.1",
      podium2nd: "亚军 No.2",
      podium3rd: "季军 No.3",
      colRank: "排名",
      colPlayer: "选手",
      colStyle: "打法风格",
      colRating: "当前积分",
      colPeak: "历史最高",
      colMatches: "总场次 (胜/负)",
      colWinRate: "生涯胜率",
      colAction: "操作",
      btnProfile: "战绩档案",

      // Tournaments
      selectEdition: "选择赛事期数",
      tabStandings: "最终排名与积分变化",
      tabGroups: "小组循环对阵表 (矩阵图)",
      tabKnockout: "淘汰赛对阵图 (Bracket)",
      statusCompleted: "已完赛",
      finalResultsTitle: "本次比赛最终成绩与积分清算",
      finalResultsSub: "开球网USATT公式结算完成",
      colPlace: "名次",
      colInitialRating: "赛前积分",
      colRatingChange: "积分变动 (Δ)",
      colNewRating: "赛后新积分",
      rankPrefix: "第 ",
      matrixTitleSuffix: "循环对阵及积分矩阵",
      matrixSub: "前两名出线进入淘汰赛",
      matrixHeaderPlayer: "选手 \\ 对阵",
      matrixHeaderRecord: "胜负场次",
      matrixHeaderDiff: "净胜局",
      koTitle: "淘汰赛阶段对阵与比分",
      koBestOf: "5局3胜 (11分制)",
      koSetScores: "单局局分",

      // Head to Head
      h2hTitle: "选手历史交锋查询 (Head-to-Head)",
      h2hSubtitle: "选择任意两位球友，查看他们在各项赛事中的历史交手胜负、大比分、单局小分及积分详情。",
      h2hPlayerA: "选手 A",
      h2hPlayerB: "选手 B",
      h2hVs: "VS",
      h2hTotalEncounters: "总计交手",
      h2hSelectDiff: "请选择两位不同的选手进行交锋战绩对比。",
      h2hMatchesTitle: "历史交战记录明细",
      h2hNoMatches: "两位选手暂无正式交战记录",
      h2hWon: "胜",

      // Message Board
      boardTitle: "球友会社区留言板",
      boardSubtitle: "欢迎约球交流、复盘比赛、讨论胶皮底板器材，支持匿名发布与互相回复。",
      boardPlaceholder: "发表留言或参与讨论...",
      boardNicknamePlaceholder: "昵称 (选填，留空显示为匿名球友)",
      btnPostMessage: "发布留言",
      btnReply: "回复",
      btnLike: "点赞",
      replyingTo: "正在回复",
      cancelReply: "取消回复",
      noMessagesYet: "暂无留言，快来发第一条讨论吧！",

      // Player Profile Modal
      currentRating: "当前积分",
      peakRating: "历史最高",
      totalMatches: "参赛总场次",
      winRate: "生涯胜率",
      chartTitle: "历史积分演变走势",
      recentMatchesTitle: "最近比赛战绩记录",
      noRecentMatches: "暂无比赛对阵记录",
      styleLabel: "打法风格",
      genderMale: "男",
      genderFemale: "女",

      // Notice / Contact Modal (CN)
      noticeBtn: "球友公告 & 联系",
      noticeTitle: "球友会公告 & 联系方式",
      noticeJoinTitle: "想要加入我们俱乐部 / 积分月赛？",
      noticeJoinDesc: "热烈欢迎各水平阶段球友交流切磋！如需报名每月积分赛、参加平日约球训练或加入我们的微信/WhatsApp球友群：",
      noticeContactPerson: "联系人",
      noticePhone: "联系电话 / 手机",
      noticeWhatsappGroup: "WhatsApp / 微信球友交流群",
      noticeJoinWhatsappBtn: "点击加入交流群",
      noticeCorrectionTitle: "比分纠错 & 系统管理员支持",
      noticeCorrectionDesc: "若发现任何比赛比分、选手初始积分或姓名有误需要更正修改，请在留言板留言反馈，或直接联系系统管理员协助处理。",
      noticeAdminContact: "系统管理员",
      noticeRulesTitle: "积分计算规则 (开球网 / USATT 互换表)",
      noticeRulesDesc: "单场比赛胜负后的积分变动量完全取决于赛前双方的分差与胜负走向：",
      noticeRulesEqual: "旗鼓相当 (分差 0–12 分)：胜者 +8 / 负者 -8 分。",
      noticeRulesHigher: "高分者胜 (常规赢球)：积分涨幅递减 (+7 至 +1 分)；分差 ≥213 分常规赢球无积分奖励 (+0)。",
      noticeRulesUpset: "低分者胜 (下克上爆冷)：积分奖励丰厚 (+10 至最高 +50 分封顶)。",
      noticeRulesDiffCol: "赛前双方分差",
      noticeRulesHigherCol: "高分者胜 (常规)",
      noticeRulesUpsetCol: "低分者胜 (爆冷)",
      noticeRulesTip: "单场比赛零和博弈：胜者所得分值即为负者扣减分值。",
      noticeCloseBtn: "我知道了",
      settingsTitle: "Supabase 数据库设置",
      settingsDesc: "在下方填入您的 Supabase 项目 URL 与 Public Anon Key。如果留空，系统将自动使用预置的俱乐部模拟数据。",
      projUrlLabel: "Project URL",
      anonKeyLabel: "Anon / Public Key",
      btnResetDemo: "恢复演示模式",
      btnSaveConnect: "保存并连接"
    }
  },

  t(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key] !== undefined) {
      return this.translations[lang][key];
    }
    return this.translations['en'][key] || key;
  },

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('khatib_lang', lang);
    if (window.app) {
      window.app.applyLanguage();
    }
  }
};

window.i18n.currentLang = window.i18n.detectDefaultLang();
