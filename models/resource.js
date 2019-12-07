var mongoose = require("mongoose");

var resourceSchema = new mongoose.Schema({
  name: String,
  imgSrc : String,
  code : String
});

module.exports = mongoose.model("resource", resourceSchema);