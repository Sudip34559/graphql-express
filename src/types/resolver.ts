import type { GraphQLResolveInfo } from "graphql";
import type { PrismaClient } from "../../generated/prisma/client";
import type { Response } from "express";

// ----- Context Type -----
export interface GQLContext {
  user?: any; // optional user object
  prisma: PrismaClient; // prisma instance
  res: Response; // express response object
}
// ----- Generic Resolver Type -----
export type GQLResolver<
  Parent = unknown,
  Args = Record<string, any>,
  Result = any
> = (
  parent: Parent,
  args: Args,
  context: GQLContext,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;
