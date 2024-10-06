DROP FUNCTION IF EXISTS get_direct_thread_id (TEXT, TEXT);

CREATE
OR REPLACE FUNCTION get_direct_thread_id (user_id_1 TEXT, user_id_2 TEXT) RETURNS UUID AS $$
DECLARE
    thread_id UUID;
BEGIN
    SELECT tp1.thread_id INTO thread_id
    FROM "thread_participants" tp1
    JOIN "thread_participants" tp2 ON tp1.thread_id = tp2.thread_id
    JOIN "threads" t ON tp1.thread_id = t.id
    WHERE tp1.user_id = user_id_1
      AND tp2.user_id = user_id_2
      AND t.type = 'direct'
    LIMIT 1;

    RETURN thread_id; -- This will return the thread_id if found, otherwise NULL
END;
$$ LANGUAGE plpgsql;


SELECT
  get_direct_thread_id (
    'user_id_1',
    'user_id_2'
  );
