create function user_name(users) returns text as $$
  select $1."firstName" || ' ' || $1."lastName";
$$ language sql immutable;
