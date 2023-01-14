const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies['x-access-token'];
    // console.log(token);
    if (token) {
      // console.log(token);
      const decoded = jwt.verify(token, 'thisismynewideA');
      // console.log(decoded);

      const user = await User.findOne({
        _id: decoded._id,
        'tokens.token': token,
      });

      if (!user) {
        throw new Error('Something went wrong!');
      }
    } else {
      throw new Error('Authentication Failed! Please Login again!!');
    }
    next();
  } catch (e) {
    // console.log(e);
    let err = e.toString().replace('Error: ', '');
    res.send(
      `<script>alert("${err}");
      location.href="login.html"</script>`
    );
  }
};

module.exports = auth;
