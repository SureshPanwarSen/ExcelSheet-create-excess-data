const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const PetroleumRecord = require('../models/petroleumRecords');
const db = require('../../config/config').db;
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

process.on('message', (msg) => {
  let oldFileInputName = msg.fileName;
  fileName = path.parse(oldFileInputName).name;
  // fileInputName = oldFileInputName.slice(0, -4) + '.json';
  if (fileName == 'import') {
    // console.log('FileInput name:= ', fileName, oldFileInputName);
    let array = xlsx.parse(fs.readFileSync(oldFileInputName));
    console.log(array.length);
    let yearOfProduct = null;
    array.forEach(element => {
      console.log(element.name);
      yearOfProduct = element.name;
      let headerArray = [];
      element.data.forEach((dataElement, i) => {
        // console.log('Data element :====== ', i, dataElement);
        if (i === 0) {
          headerArray = dataElement;
          // console.log('Header Array :== ', headerArray);
        } else {
          let headerName = null;
          dataElement.forEach((childElement, ii) => {
            // console.log(ii, "  ", childElement);
            if (ii === 0) {
              headerName = childElement;
              // console.log('Header Name :== i ', i, ' ii ', ii, headerName);
            } else if (ii < dataElement.length) {
              let lastdate, currentMonth, currentYear;
              if (ii <= 9) {
                currentMonth = 2 + ii;
                currentYear = yearOfProduct.substring(0, 4);
              } else {
                currentMonth = ii - 10;
                currentYear = yearOfProduct.substring(0, 2) + yearOfProduct.substring(yearOfProduct.length - 2);
              }
              lastdate = getLastDay(currentYear, currentMonth);
              let dateString = currentYear + '/' + (currentMonth + 1) + '/' + lastdate;
              var dateFoRecord = new Date(dateString);
              let prodValue = Math.round(childElement);

              if (i === 1) {
                // console.log(i, headerName)
                const eachData = new PetroleumRecord({
                  category: "OIL",
                  product: headerName,
                  year: yearOfProduct,
                  month: headerArray[ii],
                  date: dateFoRecord,
                  import_tmt: prodValue,
                  netImport_tmt: prodValue
                });
                eachData.save().then(data => {
                  // console.log('created := ', headerName, data);
                });
              } else if (i <= 12 && i > 1) {
                // console.log(i, headerName)
                PetroleumRecord.findOneAndUpdate({
                    product: headerName,
                    year: yearOfProduct,
                    date: dateFoRecord
                  }, {
                    $set: {
                      import_tmt: prodValue
                    }
                  }, {
                    new: true
                  },
                  function (err, doc) {
                    if (err)
                      console.log(err);
                    if (!doc) {
                      console.log('No doc found for : ', category, headerName);
                    }
                  });
              } else {
                // console.log(i, headerName)
                PetroleumRecord.findOneAndUpdate({
                    product: headerName,
                    year: yearOfProduct,
                    date: dateFoRecord
                  }, {
                    $set: {
                      export_tmt: prodValue
                    }
                  }, {
                    new: true
                  },
                  function (err, doc) {
                    if (err)
                      console.log(err);
                    if (!doc) {
                      console.log('No doc found for: ', category, headerName);
                    }
                  });
              }
            }
          });
        }
      });
    });
    // fs.writeFileSync(fileInputName, JSON.stringify(array), 'utf8');
    console.log("File done for :- ", fileName);
  } else {
    // console.log("File outside :- ", fileName);
    process.send({
      done: true
    });
    return process.exit(1);
  }
});

function getLastDay(y, m) {
  return new Date(y, m + 1, 0).getDate();
}
