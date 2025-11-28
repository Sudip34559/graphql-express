import { GraphQLError } from "graphql";
import type { GQLMiddleware } from "../types/middleware";

export const checkAuth: GQLMiddleware = async (
  resolve,
  parent,
  args,
  context,
  info
) => {
  if (!context.user)
    throw new GraphQLError("Unauthorized: No user in context", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  return resolve(parent, args, context, info);
};

export const verifyAdmin: GQLMiddleware = (
  resolve,
  parent,
  args,
  context,
  info
) => {
  if (!context.user) {
    throw new GraphQLError("Unauthorized: No user in context", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (context.user.role !== "ADMIN") {
    throw new GraphQLError("Forbidden: Admins only", {
      extensions: { code: "ACCESSDENIED" },
    });
  }

  return resolve(parent, args, context, info);
};

export const verifySeller: GQLMiddleware = (
  resolve,
  parent,
  args,
  context,
  info
) => {
  if (!context.user) {
    throw new GraphQLError("Unauthorized: No user in context", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (context.user.role !== "SELLER" && context.user.role !== "ADMIN") {
    throw new GraphQLError("Forbidden: Sellers only", {
      extensions: { code: "ACCESSDENIED" },
    });
  }

  return resolve(parent, args, context, info);
};
