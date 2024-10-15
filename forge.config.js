const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const path = require("path");

module.exports = {
  name: 'DB Buddy',
  asar: true,
  osxSign: {},
  appCategoryType: 'public.app-category.developer-tools',
  rebuildConfig: {
    // any necessary rebuild configurations
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",  // Windows
      config: {
        certificateFile: "./cert.pfx",
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
        iconUrl: "https://example.com/db-buddy.ico", // URL to the icon
        setupIcon: path.resolve(__dirname, "assets", "icons", "windows", "db-white.ico"), // Windows ICO file
      },
    },
    {
      name: "@electron-forge/maker-zip", // macOS
      platforms: ["darwin"],
      config: {
        icon: path.resolve(__dirname, "assets", "icons", "mac", "db-white.icns"), // macOS ICNS file
      },
    },
    {
      name: "@electron-forge/maker-deb", // Linux
      config: {
        name: "DB Buddy",
        icon: path.resolve(__dirname, "assets", "icons", "linux", "db-white.png"), // Linux PNG file
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
