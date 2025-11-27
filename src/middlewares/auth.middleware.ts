import { GraphQLError } from "graphql";
import { type IMiddleware } from "graphql-middleware";
import type { GQLMiddleware } from "../types/middleware";

export const checkAuth: GQLMiddleware = async (
  resolve,
  parent,
  args,
  context,
  info
) => {
  if (!context.user)
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHORIZED" },
    });
  return resolve(parent, args, context, info);
};
