const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocMessage = (username, url) => {
  return {
    username,
    url,
    createAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocMessage,
};
