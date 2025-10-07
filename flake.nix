{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    git-hooks,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      formatter = pkgs.alejandra;

      checks = {
        pre-commit = git-hooks.lib.${system}.run {
          src = ./.;
          hooks.alejandra.enable = true;
        };
      };

      devShells = {
        default = pkgs.mkShell {
          packages = with pkgs; [
            buf
            nodejs
            typescript
            bun

            (writeShellScriptBin "buf-gen" ''
              rm -rf src/gen/
              bun buf generate
            '')

            (writeShellScriptBin "run" ''
              bun run dev -p 3001
            '')

            (writeShellScriptBin "auth-schema-gen" ''
              bunx @better-auth/cli@latest --output src/db/schema.ts
              bunx drizzle-kit push --force --config drizzle.config.ts
            '')

            (writeShellScriptBin "recreate-auth-db" ''
              docker exec -it arian-postgres \
                psql -U arian -d postgres \
                -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'auth' AND pid <> pg_backend_pid();"

              docker exec -it arian-postgres \
                psql -U arian -d postgres \
                -c "DROP DATABASE IF EXISTS auth;"

              docker exec -it arian-postgres \
                psql -U arian -d postgres \
                -c "CREATE DATABASE auth OWNER arian;"
            '')
          ];

          shellHook = self.checks.${system}.pre-commit.shellHook;
        };
      };
    });
}
