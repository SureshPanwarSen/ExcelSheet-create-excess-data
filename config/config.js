const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'excel-scripts'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/excel-scripts-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'excel-scripts'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/excel-scripts-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'excel-scripts'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/excel-scripts-production'
  }
};

module.exports = config[env];
