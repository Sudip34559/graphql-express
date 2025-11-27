import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import type { IncomingHttpHeaders } from "http";
import { prisma } from "../lib/prima";
import type { Response, Request } from "express";
import { getEnv } from "../lib/env";

interface ContextParams {
  req: Request;
  res: Response;
}

export const context = async ({ req, res }: ContextParams) => {
  let token: string | null | undefined = null;

  //
  // 1. Extract token from Authorization header
  //
  const authHeader = req.headers.authorization;

  if (Array.isArray(authHeader)) {
    token = authHeader[0]?.startsWith("Bearer ")
      ? authHeader[0].split(" ")[1]
      : null;
  } else if (typeof authHeader === "string") {
    token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  }
  // console.log(token);

  //
  // 2. If no token in header → check HTTP-only cookie
  //
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // console.log(token);

  //
  // No token → public request context
  //
  if (!token) {
    return { prisma, res };
  }

  //
  // 3. Validate JWT
  //
  try {
    const validatedToken = jwt.verify(token, getEnv("ACCESS_TOKEN_SECRET")) as {
      id: number;
    };

    if (!validatedToken) {
      return { prisma, res };
    }
    //
    // 4. Fetch user from DB
    //
    const user = await prisma.user.findUnique({
      where: { id: validatedToken.id },
    });

    // console.log(user);

    return { user, prisma, res };
  } catch (error) {
    return { prisma, res };
  }
};
