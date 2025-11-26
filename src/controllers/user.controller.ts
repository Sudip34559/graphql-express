import "dotenv/config";
import bcrypt from "bcryptjs";
import type { GQLResolver } from "../types/resolver";
import { graphql, GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { getEnv } from "../lib/env";

export const generateAccessToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    getEnv("ACCESS_TOKEN_SECRET"),
    {
      expiresIn: getEnv("ACCESS_TOKEN_EXPIRY") as jwt.SignOptions["expiresIn"],
    }
  );
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
    },
    getEnv("REFRESH_TOKEN_SECRET"),
    {
      expiresIn: getEnv("REFRESH_TOKEN_EXPIRY") as jwt.SignOptions["expiresIn"],
    }
  );
};

export const getAllUsers: GQLResolver = async (_, __, context) => {
  const users = await context.prisma.user.findMany();
  return users;
};

export const getUser: GQLResolver<{ id: number }> = async (
  _,
  args,
  context
) => {
  const user = await context.prisma.user.findUnique({
    where: { id: args.id },
  });
  return user;
};

export const createUser: GQLResolver<{
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: string;
}> = async (_, args, context) => {
  try {
    const existedUser = await context.prisma.user.findUnique({
      where: { email: args.email },
    });

    if (existedUser) {
      throw new GraphQLError("User allready exsist", {
        extensions: { code: "ALLREADY_EXSIST" },
      });
    }

    const hashedPassword = await bcrypt.hash(args.password, 10);
    const newUser = await context.prisma.user.create({
      data: {
        name: args.name,
        email: args.email,
        password: hashedPassword,
        avatar: args.avatar,
        role: args.role || "customer",
      },
    });
    return newUser;
  } catch (error: any) {
    throw new GraphQLError(error, {
      extensions: { code: "INTARNAL_SERVER_ERROR" },
    });
  }
};

export const loginUser: GQLResolver<{
  email: string;
  password: string;
}> = async (_, args, context) => {
  const user = await context.prisma.user.findUnique({
    where: { email: args.email },
  });
  if (!user) {
    throw new GraphQLError("User not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }
  const validPassword = await bcrypt.compare(args.password, user.password);
  if (!validPassword) {
    throw new GraphQLError("Invalid password", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { refreshToken, accessToken } = {
    refreshToken: generateRefreshToken(user),
    accessToken: generateAccessToken(user),
  };

  if (!refreshToken || !accessToken) {
    throw new GraphQLError("Token generation failed", {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }

  await context.prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: refreshToken },
  });

  context.res
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options);

  return { ...user, accessToken, refreshToken };
};

export const userProfile: GQLResolver = async (_, args, context) => {
  if (!context.user) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHOROZED" },
    });
  }

  return await context.prisma.user.findUnique({
    where: { id: context.user.id },
  });
};
