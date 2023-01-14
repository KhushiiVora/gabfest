const express = require('express');
/*body-parser is node.js body parsing middleware. It is responsible for parsing the incoming request bodies in a middleware before you handle it. It extracts the entire body of an incoming request stream and expose it on req.body.*/
const bodyParser = require('body-parser');
const path = require('path');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();

/*bodyParser.urlencoded() will parse the text data of html into urlencoded form and exposes it in req.body*/
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/signup', urlencodedParser, async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();

    const token = await user.genAuthToken();
    console.log('token--> ', token);
    res.cookie('x-access-token', token, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.sendFile(
      'C:/Users/91942/Desktop/nodejs-course/Chat-app-1/public/room.html'
    );
  } catch (e) {
    // console.log(e);
    if (e.code == 11000) {
      res.send(
        `<script>alert("Entered E-mail has already been taken! Please Try again.");
        location.href="signup.html"</script>`
      );
    } else {
      let err = e.toString().replace('ValidationError: ', '');
      err = err.replace('Error: ', '');
      res.send(
        `<script>alert("${err}");
      location.href="signup.html"</script>`
      );
    }
  }
});

router.post('/login', urlencodedParser, async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.genAuthToken();
    // console.log(token);

    res.cookie('x-access-token', token, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.sendFile(
      'C:/Users/91942/Desktop/nodejs-course/Chat-app-1/public/room.html'
    );
  } catch (e) {
    const err = e.toString().replace('Error: ', '');
    // console.log(e);
    res.send(
      `<script>alert("${err}");
      location.href="login.html"</script>`
    );
  }
});

router.get('/logout', auth, async (req, res) => {
  try {
    res.clearCookie('x-access-token');
    res.send(
      `<script>alert("Successfully logout.");
      location.href="login.html"</script>`
    );
  } catch (e) {
    console.log(e);
    res.send(
      `<script>alert("Something went wrong.");
       location.href="index.html"</script>`
    );
  }
});

module.exports = router;
