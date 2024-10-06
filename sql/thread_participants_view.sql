CREATE OR REPLACE VIEW
  thread_participants AS
SELECT
  p.user_id AS "user_id",
  p.thread_id AS "thread_id",
  u."firstName" AS "firstName",
  u."lastName" AS "lastName",
  u."imageUrl" AS "imageUrl",
  u.email AS "email",
  t.created_at AS "thread_created_at",
  t.last_text_at AS "last_text_at"
FROM
  "participants" p
  JOIN "users" u ON p.user_id = u.id
  JOIN "threads" t ON p.thread_id = t.id;
