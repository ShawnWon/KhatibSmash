-- ==============================================================================
-- KhatibSmash (乒乓球开球网风格积分赛系统) - Supabase Database Schema
-- ==============================================================================

-- 1. Enable UUID Extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Players Table (选手基本信息与当前战绩)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT DEFAULT '',
    gender VARCHAR(10) DEFAULT 'M',          -- 'M' or 'F'
    grip_style VARCHAR(50) DEFAULT '横板双反',   -- '横板双反', '直板单桧', '生胶颗粒', etc.
    initial_rating INT NOT NULL DEFAULT 1200,
    current_rating INT NOT NULL DEFAULT 1200,
    peak_rating INT NOT NULL DEFAULT 1200,
    total_matches INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tournaments Table (赛事表)
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    tournament_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location VARCHAR(200) DEFAULT 'Khatib Table Tennis Hall',
    status VARCHAR(50) DEFAULT 'completed',   -- 'draft', 'in_progress', 'completed'
    format VARCHAR(100) DEFAULT '分组循环+淘汰赛',
    rules_notes TEXT DEFAULT '胜负局11分制，开球网积分计算规则',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tournament Participants (参赛选手 & 单次赛事积分结算)
CREATE TABLE IF NOT EXISTS tournament_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    starting_rating INT NOT NULL,
    ending_rating INT,
    rating_change INT DEFAULT 0,
    final_rank INT,                           -- 最终名次 1, 2, 3, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, player_id)
);

-- 5. Tournament Groups (小组划分)
CREATE TABLE IF NOT EXISTS tournament_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    group_name VARCHAR(50) NOT NULL,          -- 如 'A组', 'B组'
    order_index INT DEFAULT 0
);

-- 6. Matches Table (比赛对阵表与成绩)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,               -- 'group' (小组赛) 或 'knockout' (淘汰赛)
    group_name VARCHAR(50) DEFAULT '',        -- 'A组', 'B组' (淘汰赛可为空)
    round_name VARCHAR(100) NOT NULL,         -- '小组赛第1轮', '1/4决赛', '半决赛', '决赛'
    player1_id UUID REFERENCES players(id) ON DELETE RESTRICT,
    player2_id UUID REFERENCES players(id) ON DELETE RESTRICT,
    player1_score INT DEFAULT 0,              -- 大比分 胜局数 (如 3 或 2)
    player2_score INT DEFAULT 0,              -- 大比分 胜局数 (如 1 或 0)
    set_scores TEXT DEFAULT '',               -- 小分比如 "11-9,8-11,11-6"
    winner_id UUID REFERENCES players(id),
    p1_rating_before INT,
    p2_rating_before INT,
    p1_rating_change INT DEFAULT 0,
    p2_rating_change INT DEFAULT 0,
    played_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Rating History (积分历史流水变动)
CREATE TABLE IF NOT EXISTS rating_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    old_rating INT NOT NULL,
    new_rating INT NOT NULL,
    change INT NOT NULL,
    reason VARCHAR(100) DEFAULT 'Match Result',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Row Level Security (RLS) & Public Read
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_history ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Public can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Public can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public can view participants" ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "Public can view groups" ON tournament_groups FOR SELECT USING (true);
CREATE POLICY "Public can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public can view rating_history" ON rating_history FOR SELECT USING (true);

-- Allow Public Insert/Update for demo / management without complex auth (or use Supabase Anon Key)
CREATE POLICY "Anon insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update players" ON players FOR UPDATE USING (true);
CREATE POLICY "Anon insert tournaments" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update tournaments" ON tournaments FOR UPDATE USING (true);
CREATE POLICY "Anon insert participants" ON tournament_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update participants" ON tournament_participants FOR UPDATE USING (true);
CREATE POLICY "Anon insert groups" ON tournament_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Anon insert rating_history" ON rating_history FOR INSERT WITH CHECK (true);
