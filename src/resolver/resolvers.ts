import {
  createUser,
  getAllUsers,
  getUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  userProfile,
} from "../controllers/user.controller.js";
import { checkAuth } from "../middlewares/auth.middleware.js";
import { gqlMiddleware } from "../middlewares/gql.middleware.js";

const resolvers = {
  Query: {
    users: getAllUsers,
    user: getUser,
    userProfile: gqlMiddleware(checkAuth, userProfile),
  },
  Mutation: {
    createUser,
    loginUser,
    logoutUser: gqlMiddleware(checkAuth, logoutUser),
    refreshAccessToken,
  },
};
export { resolvers };
