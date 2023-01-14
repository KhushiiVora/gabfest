const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/ChatApp-api', {
  useNewUrlParser: true,
});

// const User = mongoose.model('User', {
//   name: {
//     type: String,
//   },
// });

// const user = new User({
//   name: 'Khushi',
// });

// user
//   .save()
//   .then(() => {
//     console.log('in Mongoose.js', user);
//   })
//   .catch(e => {
//     console.log('Error!', e);
//   });
