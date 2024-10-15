const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const path = require("path"); // Import path module

module.exports = {
  packagerConfig: {
    name: "DB Buddy",
    asar: true,
    osxSign: {},
    appCategoryType: "public.app-category.developer-tools",
    icon: path.join(__dirname, 'assets', 'icons', 'mac', 'db-white'), // For macOS
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        certificateFile: "./cert.pfx",
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
        icon: path.join(__dirname, 'assets', 'icons', 'windows', 'db-white.ico'), // For Windows
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: {
        icon: path.join(__dirname, 'assets', 'icons', 'mac', 'db-white.png'), // Optional for ZIP on macOS
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        name: "DB Buddy",
        icon: path.join(__dirname, 'assets', 'icons', 'linux', 'db-white.png'), // For Linux
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
