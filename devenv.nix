{pkgs,...}:{
  packages = [ pkgs.buf ];

  languages = {
    typescript.enable = true;
    javascript = {
      enable = true;
      bun.enable = true;
    };
  };

  scripts.buf-gen.exec = "rm -rf src/gen/; bun buf generate";

  scripts.auth-schema-gen.exec = ''
    bunx @better-auth/cli@latest --output src/db/schema.ts
    bunx drizzle-kit push --force --config drizzle.config.ts
  '';

  scripts.recreate-auth-db.exec = ''
    docker exec -it arian-postgres \
      psql -U arian -d postgres \
      -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'auth' AND pid <> pg_backend_pid();"

    docker exec -it arian-postgres \
      psql -U arian -d postgres \
      -c "DROP DATABASE IF EXISTS auth;"

    docker exec -it arian-postgres \
      psql -U arian -d postgres \
      -c "CREATE DATABASE auth OWNER arian;"
  '';

  dotenv.enable = true;
}