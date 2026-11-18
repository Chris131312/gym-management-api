-- gym_settings is a single-row table (id = 1) that the API only ever UPDATEs,
-- so a fresh database had no row and GET/PUT /settings/gym returned 404.
-- No-op where the row already exists.
INSERT INTO gym_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
