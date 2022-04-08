const mongoose = require("mongoose");
/*const uniqueValidator = require("mongoose-unique-validator");*/

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true /*, unique: true*/ },
  password: { type: String, required: true },
  lists: [{ type: mongoose.Types.ObjectId, required: true, ref: "List" }],
});

/*userSchema.plugin(uniqueValidator);*/

module.exports = mongoose.model("User", userSchema);
