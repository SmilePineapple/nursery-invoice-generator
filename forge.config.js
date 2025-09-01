module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon.png'
  },
  rebuildConfig: {},
  makers: [
    // Disabling Squirrel maker due to icon issues
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   config: {
    //     name: 'nursery_invoice_generator'
    //   },
    // },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './assets/icon.png'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
