import type { GQLResolver } from "./resolver";

export type GQLMiddleware = (
  next: GQLResolver,
  parent: any,
  args: Record<string, any>,
  context: any,
  info: any
) => any;
