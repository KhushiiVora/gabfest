const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    // Throws error if username contains other character than (a-z,A-Z)
    validate(value) {
      if (!validator.isAlpha(value)) {
        throw new Error(
          'Unable to SignUp! Username should only contain alphabets!'
        );
      }
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      // Throws error message when email is not valid
      if (!validator.isEmail(value)) {
        throw new Error('Unable to SignUp! Invalid Email!');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    // minLength: 7,
    validate(value) {
      if (value.length < 8) {
        throw new Error(
          'Unable to SignUp! Password must contain atleast 8 charcters!'
        );
      }
    },
  },
  tokens: [
    {
      /*Each token in an tokens array will be an object with a single field called token.*/
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//--------------AUTHENTICATING USER-------------
userSchema.methods.genAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewideA', {
    expiresIn: '1 day',
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//--------------Hashing Passwords-------------
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, 8);
  }

  next(); //we call next() to inform that password hashing is done in order to perform next task which is to save the user information
});

//---------------Login Function---------------
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });
  //If user doesn't exists (Checking existence of user)
  if (!user) {
    throw new Error('Unable to login! Check your email and password!');
  } else {
    const isMatch = await bcryptjs.compare(password, user.password);

    //If user exists but Password is invalid (Checking password validation)
    if (!isMatch) {
      throw new Error('Unable to login! Check your email and password!');
    } else {
      console.log('Login Successful!');
      return user; //------------------
    }
  }
};
const User = mongoose.model('User', userSchema);

module.exports = User;
