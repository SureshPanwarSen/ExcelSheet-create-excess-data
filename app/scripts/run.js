const fs = require('fs');
const {
  fork
} = require('child_process');
const mongoose = require('mongoose');
const PetroleumRecord = require('../models/petroleumRecords');
const config = require('../../config/config');
const db = config.db;
const async = require('async');
const Promise = require('bluebird').Promise;

mongoose.Promise = Promise;

mongoose.connect(db, {
  useMongoClient: true
}, function (err) {
  if (err) {
    console.log("Error while connecting to db :- " + err);
  }
});

const directoryToWorkOn = '/home/ideaplunge/Desktop/cdfi/PetroleumSheets';

function traverseFileSystem(currentPath, type) {
  const deferred = Promise.defer();
  fs.readdir(currentPath, (err, files) => {
    if (err) return deferred.reject(err);
    async.eachOf(files, (file, f, cb) => {
      let currentFile = currentPath + '/' + file;
      fs.stat(currentFile, (err, fStat) => {
        if (err) return cb(err);
        // console.log(currentFile);
        if (fStat.isDirectory()) {
          traverseFileSystem(currentFile, type).then(() => {
            return cb();
          });
        } else {
          if (file.indexOf('.xls#') > 0 || file.indexOf('.json') > 0) {
            return cb();
          }
          let forked;
          if (type == 1) {
            forked = fork('consumption.js');
          } else if (type == 2) {
            forked = fork('production.js');
          } else if (type == 3) {
            forked = fork('import-export.js');
          }
          forked.send({
            fileName: currentFile
          });
          forked.on('message', (msg) => {
            if (msg.done) {
              return cb();
            }
          })
        }
      })
    }, (err, done) => {
      if (err) return deferred.reject(err);
      deferred.resolve();

    })
  });
  return deferred.promise;
};

if (process.argv[2] == 'consump') {
  PetroleumRecord.remove({}, (err, removed) => {
    if (err) {
      console.error(err);
      process.exit(0);
    }
    return traverseFileSystem(directoryToWorkOn, 1).then(() => {
      console.log('xlsx to Json done !');
      process.exit(0);
    });
  });
} else if (process.argv[2] == 'prod') {
  return traverseFileSystem(directoryToWorkOn, 2).then(() => {
    console.log('Petroleum record production added !');
    process.exit(0);
  });
} else if (process.argv[2] == 'impexp') {
  return traverseFileSystem(directoryToWorkOn, 3).then(() => {
    console.log('Petroleum record imports exports added !');
    process.exit(0);
  });
} else if (process.argv[2] == 'net') {
  netImportAndProduction();
}

function netImportAndProduction() {
  PetroleumRecord.find({
      category: 'Product'
    }, {},
    function (err, result) {
      result.forEach(element => {
        if (element.product !== 'PETROLEUM COKE') {
          let netImport_tmt = element.import_tmt - element.export_tmt;
          PetroleumRecord.updateOne({
            _id: element._id
          }, {
            $set: {
              netImport_tmt: netImport_tmt
            }
          }, function (err, res) {
            console.log('Response ', res);
          })
        }
      });
    });
}
