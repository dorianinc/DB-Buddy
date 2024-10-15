const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const path = require("path"); // Import path module

module.exports = {
  packagerConfig: {
    name: "DB Buddy",
    asar: true,
    osxSign: {},
    appCategoryType: "public.app-category.developer-tools",
    icon: path.join(__dirname, "assets", "icons", "mac", "db-white"),
  },
  rebuildConfig: {},
  makers: [
    // Windows
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "db-buddy",
        icon: path.join(
          __dirname,
          "assets",
          "icons",
          "windows",
          "db-white.ico"
        ),
        certificateFile: "./cert.pfx",
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
      },
    },

    // macOS
    // {
    //   name: "@electron-forge/maker-dmg",
    //   config: {
    //     iconSize: 100, 
    //     background: path.join(__dirname, "assets", "images", "dmg-background.jpg"),
    //     window: {
    //       width: 600,
    //       height: 400
    //     },
    //     format: 'ULFO' 
    //   }
    // },
    
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: {
        name: "DB Buddy",
        icon: path.join(__dirname, "assets", "icons", "mac", "db-white.png"),
      },
    },

    // Linux
    {
      name: "@electron-forge/maker-deb",
      config: {
        name: "db-buddy",
        icon: path.join(__dirname, "assets", "icons", "linux", "db-white.png"),
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
