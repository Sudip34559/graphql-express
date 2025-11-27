import type { GQLResolver } from "./resolver";

export type Middleware = (resolver: GQLResolver) => GQLResolver;
export type GQLMiddleware = (
  next: GQLResolver,
  parent: any,
  args: Record<string, any>,
  context: any,
  info: any
) => any;
