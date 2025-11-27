// utils/gqlMiddleware.ts

import type { GQLMiddleware } from "../types/middleware";
import type { GQLResolver } from "../types/resolver";

export const gqlMiddleware = (
  ...fns: (GQLMiddleware | GQLResolver)[]
): GQLResolver => {
  const resolver = fns.pop() as GQLResolver;

  return (parent, args, context, info) => {
    let index = -1;

    const dispatch = (i: number): any => {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }

      index = i;
      const fn = fns[i];

      if (!fn) {
        return resolver(parent, args, context, info);
      }

      return (fn as GQLMiddleware)(
        (...args) => dispatch(i + 1),
        parent,
        args,
        context,
        info
      );
    };

    return dispatch(0);
  };
};
