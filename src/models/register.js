const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
      maxLength:10
    },
    lastName: {
      type: String,
      required: true,
      maxLength:10
    },
    username: {
      type: String,
      required: true,
      unique:true
    },
    email: {
      type: String,
      required: true,
      unique:true,
      lowercase:true
    }
  });

  var options = {
    errorMessages: {
        MissingPasswordError: 'No password was given',
        IncorrectPasswordError: 'Password or username are incorrect',
        IncorrectUsernameError: 'Password or username are incorrect',
        MissingUsernameError: 'No username was given',
        UserExistsError: 'A user with the given username is already registered'
    }
  };
  
  userSchema.plugin(passportLocalMongoose,options);
  
  const User = mongoose.model("User", userSchema);

  module.exports = User;
