const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
  /*CLEAN THE DATA
    trim() is used to remove spaces before and after*/
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  /*VALIDATE THE DATA*/
  if (!username || !room) {
    return {
      error: 'Username and room are required!',
    };
  }

  /*CHECK FOR EXISTING USER*/
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  /*VALIDATE USERNAME*/
  if (existingUser) {
    return {
      error: 'Display name is in use!',
    };
  }

  /*STORE USER*/
  const user = { id, username, room };
  users.push(user);
  return { user };
};

/*REMOVE USER*/

const removeUser = id => {
  /*findIndex returns the position in an array while find returns an element*/
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    /*user.splice this allows to remove item from an array by their index.
    It accept 'position' to remove and 'no. of item' to remove
    users.splice(index, 1) returns array then we extract the individual item [0] as user object
    [0] returns the user object
    
    NOTE: LIMITATION OF FILTER IS THAT IT KEEPS RUNNING EVEN AFTER THE MATCH IS FOUND.
    THIS CODE IS A BIT FASTER SINCE FINDINDEX IS GOING TO STOP SEARCHING ONCE THE MATCH IS FOUND
    it returns object bcz users array consists of an user objects*/

    return users.splice(index, 1)[0];
  }
};

// addUser({
//   id: 22,
//   username: 'Khushi',
//   room: 'vora family',
// });

// addUser({
//   id: 21,
//   username: 'Khushali',
//   room: 'vora family',
// });

// addUser({
//   id: 23,
//   username: 'Khushbu',
//   room: 'family',
// });

/*GET USER*/

const getUser = id => {
  return users.find(user => user.id === id);
};

// console.log(getUser(22));

/*GET USERS IN ROOM*/

const getUsersInRoom = room => {
  return users.filter(user => user.room === room);
};

// const userList = getUsersInRoom('famil');
// console.log(userList);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
