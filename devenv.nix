{pkgs,...}:{
  packages = [ pkgs.buf ];

  languages = {
    typescript.enable = true;
    javascript = {
      enable = true;
      bun.enable = true;
    };
  };

  dotenv.enable = true;
}