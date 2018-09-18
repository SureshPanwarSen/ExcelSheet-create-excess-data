const where = require('node-where');

where.is('RAIPUR (M CORP.)', function (err, result) {
  if (result) {
        console.log(result.get('lat'));
        console.log(result.get('lng'));
  }
});