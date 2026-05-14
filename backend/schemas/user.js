const mongoose = require("mongoose");

const user = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      set: function (value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    role: {
      type: String,
      required: [true, "role is required"],
    },
  },
  {
    strict: false,
  },
);

const userSchema = mongoose.model("user", user);

module.exports = userSchema;
