-- ==============================================================================
-- Guestbook / Message Board Schema with Anonymous Posting & Threaded Replies
-- ==============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
    avatar_seed VARCHAR(100) DEFAULT 'pingpong',
    content TEXT NOT NULL,
    parent_id UUID REFERENCES messages(id) ON DELETE CASCADE, -- NULL for top-level posts, non-null for replies
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view messages" ON messages FOR SELECT USING (true);

-- Allow public anonymous posting
CREATE POLICY "Public can post messages" ON messages FOR INSERT WITH CHECK (true);

-- Allow updating likes
CREATE POLICY "Public can like messages" ON messages FOR UPDATE USING (true);
