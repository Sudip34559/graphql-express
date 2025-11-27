import {
  createUser,
  getAllUsers,
  getUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  userProfile,
} from "../controllers/user.controller.js";

const resolvers = {
  Query: {
    users: getAllUsers,
    user: getUser,
    userProfile,
  },
  Mutation: {
    createUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
  },
};
export { resolvers };
