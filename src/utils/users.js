const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate
  if (!username || !room) {
    return {
      error: 'Username and room are required!',
    };
  }

  // Check existing user
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  // Validate username
  if (existingUser) {
    return {
      error: 'Username already exists!',
    };
  }

  // Store User
  const user = { id, username, room };
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((el) => el.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((el) => el.id === id);

  // if (!user) {
  //   return {
  //     error: 'No user found!',
  //   };
  // }

  return user;
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();

  const usersInRoom = users.filter((el) => el.room === room);

  // if (!usersInRoom) {
  //   return {
  //     error: 'No users found!',
  //   };
  // }

  return usersInRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
