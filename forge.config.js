const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const path = require("path"); // Import path module

module.exports = {
  packagerConfig: {
    name: "DB Buddy",
    executableName: "db-buddy",
    asar: true,
    osxSign: {},
    appCategoryType: "public.app-category.developer-tools",
    icon: path.join(__dirname, "assets", "icons", "db-white"), // No extension for cross-platform
  },
  rebuildConfig: {},
  makers: [
    // Windows
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "db-buddy",
        iconUrl: "https://yourwebsite.com/path-to-icon.ico", // Optional for metadata
        setupIcon: path.join(__dirname, "assets", "icons", "windows", "db-white.ico"), // Desktop shortcut icon
        certificateFile: "./cert.pfx",
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
      },
    },

    // macOS
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: {
        name: "DB Buddy",
        icon: path.join(__dirname, "assets", "icons", "mac", "db-white.png"),
        // icon: path.join(__dirname, "assets", "icons", "mac", "db-white.icns"), // Use .icns for macOS
      },
    },

    // Linux
    {
      name: "@electron-forge/maker-deb",
      config: {
        name: "db-buddy",
        icon: path.join(__dirname, "assets", "icons", "linux", "db-white.png"), // Use .png for Linux
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
