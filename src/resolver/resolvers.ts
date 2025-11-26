import {
  createUser,
  getAllUsers,
  getUser,
  loginUser,
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
  },
};
export { resolvers };
