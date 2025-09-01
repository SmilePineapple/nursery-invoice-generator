const icongen = require('electron-icon-maker');

const iconConfig = {
  inputFile: './assets/icon.png',
  outputPath: './assets',
  flatten: true,
  icons: {
    ico: {
      name: 'icon',
      sizes: [16, 24, 32, 48, 64, 128, 256]
    },
    icns: {
      name: 'icon',
      sizes: [16, 32, 64, 128, 256, 512, 1024]
    },
    png: {
      name: 'icon',
      sizes: [16, 24, 32, 48, 64, 128, 256, 512]
    }
  }
};

icongen(iconConfig)
  .then(() => {
    console.log('Icon generation complete');
  })
  .catch((error) => {
    console.error('Error generating icons:', error);
  });
