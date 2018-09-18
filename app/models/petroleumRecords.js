const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PetroleumRecordSchema = new Schema({
  category: String,
  product: String,
  oil: String,
  year: String,
  month: String,
  date: Date,
  production_tmt: Number,
  consumption_tmt: Number,
  import_tmt: Number,
  export_tmt: Number,
  netImport_tmt: Number
});

module.exports = mongoose.model('PetroleumRecord', PetroleumRecordSchema);
