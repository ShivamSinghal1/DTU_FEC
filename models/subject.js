var mongoose = require("mongoose");

var subjectSchema = new mongoose.Schema({
  name: String,
  imgSrc : String,
  text : String,
  code : String
});


module.exports = mongoose.model("subject", subjectSchema);