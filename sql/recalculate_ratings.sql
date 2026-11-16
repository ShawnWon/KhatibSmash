-- ==============================================================================
-- Auto-Calculation Engine for Ratings (开球网 / USATT 自动积分清算函数)
-- Execute this script in your Supabase SQL Editor.
-- It can recalculate everything from raw matches, or settle tournament by tournament.
-- ==============================================================================

-- 1. Helper Function: Calculate Rating Exchange Delta (开球网积分差距对照表)
CREATE OR REPLACE FUNCTION calc_rating_delta(r_winner INT, r_loser INT)
RETURNS INT LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    diff INT;
    delta INT := 8;
BEGIN
    diff := ABS(r_winner - r_loser);
    
    IF r_winner >= r_loser THEN
        -- 高分者获胜 (高胜低，积分涨幅较小)
        IF diff <= 12 THEN delta := 8;
        ELSIF diff <= 37 THEN delta := 7;
        ELSIF diff <= 62 THEN delta := 6;
        ELSIF diff <= 87 THEN delta := 5;
        ELSIF diff <= 112 THEN delta := 4;
        ELSIF diff <= 137 THEN delta := 3;
        ELSIF diff <= 162 THEN delta := 2;
        ELSIF diff <= 187 THEN delta := 2;
        ELSIF diff <= 212 THEN delta := 1;
        ELSE delta := 0; -- 差距超过 212 分，正常胜无积分奖励
        END IF;
    ELSE
        -- 低分者爆冷胜 (低胜高，积分奖励丰厚)
        IF diff <= 12 THEN delta := 8;
        ELSIF diff <= 37 THEN delta := 10;
        ELSIF diff <= 62 THEN delta := 13;
        ELSIF diff <= 87 THEN delta := 16;
        ELSIF diff <= 112 THEN delta := 20;
        ELSIF diff <= 137 THEN delta := 25;
        ELSIF diff <= 162 THEN delta := 30;
        ELSIF diff <= 187 THEN delta := 35;
        ELSIF diff <= 212 THEN delta := 40;
        ELSE delta := 50; -- 最大爆冷封顶 50 分
        END IF;
    END IF;

    RETURN delta;
END;
$$;


-- 2. Stored Procedure: Recalculate All Ratings from the Beginning
-- This iterates chronologically through all matches and updates:
--  - matches (p1_rating_before, p2_rating_before, p1_rating_change, p2_rating_change)
--  - players (current_rating, peak_rating, total_matches, total_wins, total_losses)
--  - rating_history (re-creates clean chronological logs)
CREATE OR REPLACE FUNCTION recalculate_all_ratings()
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    m RECORD;
    p RECORD;
    r1_before INT;
    r2_before INT;
    rw_before INT;
    rl_before INT;
    delta INT;
    p1_delta INT;
    p2_delta INT;
BEGIN
    -- Step A: Reset all players to their initial_rating
    UPDATE players 
    SET current_rating = initial_rating,
        peak_rating = initial_rating,
        total_matches = 0,
        total_wins = 0,
        total_losses = 0,
        updated_at = NOW();

    -- Clear previous rating history
    DELETE FROM rating_history;

    -- Step B: Iterate through every match in chronological order
    FOR m IN 
        SELECT m.*, t.tournament_date 
        FROM matches m
        JOIN tournaments t ON m.tournament_id = t.id
        ORDER BY t.tournament_date ASC, m.played_at ASC, m.id ASC
    LOOP
        -- Skip match if no winner designated yet
        IF m.winner_id IS NULL OR (m.player1_score = 0 AND m.player2_score = 0) THEN
            CONTINUE;
        END IF;

        -- Fetch current ratings of both players
        SELECT current_rating INTO r1_before FROM players WHERE id = m.player1_id;
        SELECT current_rating INTO r2_before FROM players WHERE id = m.player2_id;

        -- Determine winner and loser initial ratings
        IF m.winner_id = m.player1_id THEN
            rw_before := r1_before;
            rl_before := r2_before;
            delta := calc_rating_delta(rw_before, rl_before);
            p1_delta := delta;
            p2_delta := -delta;
        ELSE
            rw_before := r2_before;
            rl_before := r1_before;
            delta := calc_rating_delta(rw_before, rl_before);
            p1_delta := -delta;
            p2_delta := delta;
        END IF;

        -- Update match record with rating snapshots
        UPDATE matches 
        SET p1_rating_before = r1_before,
            p2_rating_before = r2_before,
            p1_rating_change = p1_delta,
            p2_rating_change = p2_delta
        WHERE id = m.id;

        -- Update Player 1
        UPDATE players 
        SET current_rating = current_rating + p1_delta,
            peak_rating = GREATEST(peak_rating, current_rating + p1_delta),
            total_matches = total_matches + 1,
            total_wins = total_wins + CASE WHEN m.winner_id = m.player1_id THEN 1 ELSE 0 END,
            total_losses = total_losses + CASE WHEN m.winner_id = m.player2_id THEN 1 ELSE 0 END,
            updated_at = NOW()
        WHERE id = m.player1_id;

        -- Update Player 2
        UPDATE players 
        SET current_rating = current_rating + p2_delta,
            peak_rating = GREATEST(peak_rating, current_rating + p2_delta),
            total_matches = total_matches + 1,
            total_wins = total_wins + CASE WHEN m.winner_id = m.player2_id THEN 1 ELSE 0 END,
            total_losses = total_losses + CASE WHEN m.winner_id = m.player1_id THEN 1 ELSE 0 END,
            updated_at = NOW()
        WHERE id = m.player2_id;

        -- Log history for Player 1
        INSERT INTO rating_history(player_id, tournament_id, match_id, old_rating, new_rating, change, reason, recorded_at)
        VALUES(m.player1_id, m.tournament_id, m.id, r1_before, r1_before + p1_delta, p1_delta, m.round_name, m.played_at);

        -- Log history for Player 2
        INSERT INTO rating_history(player_id, tournament_id, match_id, old_rating, new_rating, change, reason, recorded_at)
        VALUES(m.player2_id, m.tournament_id, m.id, r2_before, r2_before + p2_delta, p2_delta, m.round_name, m.played_at);

    END LOOP;

    -- Step C: Update Tournament Participants ending_rating and rating_change
    FOR p IN 
        SELECT tp.id, tp.tournament_id, tp.player_id, tp.starting_rating
        FROM tournament_participants tp
    LOOP
        UPDATE tournament_participants tp
        SET ending_rating = (SELECT current_rating FROM players WHERE id = p.player_id),
            rating_change = (SELECT current_rating FROM players WHERE id = p.player_id) - p.starting_rating
        WHERE tp.id = p.id;
    END LOOP;

END;
$$;
