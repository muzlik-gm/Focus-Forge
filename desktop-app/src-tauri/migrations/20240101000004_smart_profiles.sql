-- Application metadata cache (Wikidata API results)
CREATE TABLE IF NOT EXISTS application_metadata_cache (
    application TEXT PRIMARY KEY,
    description TEXT,
    tags TEXT,
    fetched_at INTEGER NOT NULL
);

-- Work Profiles
CREATE TABLE IF NOT EXISTS work_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    productive_tags TEXT,
    distracting_tags TEXT
);

INSERT INTO work_profiles (id, name, description, productive_tags, distracting_tags) VALUES
    ('dev_web', 'Web Development', 'Focusing on frontend and backend web tasks', '["programming", "ide", "web browser", "database", "terminal", "utility"]', '["social network", "game", "streaming service", "entertainment"]'),
    ('dev_game', 'Game Development', 'Building and designing games', '["game engine", "3d modeling", "programming", "ide", "graphics editor", "utility"]', '["social network", "streaming service", "communication"]'),
    ('art_design', 'Art & Design', 'Creating digital art and UI designs', '["graphics editor", "vector graphics", "3d modeling", "animation software", "design", "utility"]', '["social network", "game", "programming"]'),
    ('writing', 'Writing', 'Drafting documents and research', '["word processor", "markdown editor", "note-taking application", "reference manager", "utility"]', '["social network", "game", "streaming service"]');
