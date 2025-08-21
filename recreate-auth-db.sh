# 1) terminate connections to "auth"
docker exec -it arian-postgres \
  psql -U arian -d postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'auth' AND pid <> pg_backend_pid();"

# 2) drop it
docker exec -it arian-postgres \
  psql -U arian -d postgres \
  -c "DROP DATABASE IF EXISTS auth;"

# 3) recreate it
docker exec -it arian-postgres \
  psql -U arian -d postgres \
  -c "CREATE DATABASE auth OWNER arian;"
