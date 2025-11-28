import * as grpc from "@grpc/grpc-js";
import { getEnv } from "../lib/env";
import { prisma } from "../lib/prima";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "./user.controller";

export const authService = {
  ValidateToken: async (
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) => {
    const token = call.request.token;
    // console.log(token);

    try {
      //   console.log(getEnv("ACCESS_TOKEN_SECRET"));
      //   console.log("Before verify");
      const validatedToken = jwt.verify(
        token,
        getEnv("ACCESS_TOKEN_SECRET")
      ) as {
        id: number;
      };
      //   console.log("Before verify");
      // console.log(validatedToken);

      const user = await prisma.user.findUnique({
        where: { id: validatedToken.id },
      });
      // console.log(user);

      if (user) {
        callback(null, {
          isValid: true,
          userId: validatedToken.id,
          role: user.role,
        });
      } else {
        callback(null, { isValid: false });
      }
    } catch (error) {
      callback(null, { isValid: false });
    }
  },
  RefreshToken: async (
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) => {
    const token = call.request.refreshToken;
    try {
      const validatedToken = jwt.verify(
        token,
        getEnv("REFRESH_TOKEN_SECRET")
      ) as {
        id: number;
      };

      const user = await prisma.user.findUnique({
        where: { id: validatedToken.id },
      });

      if (user) {
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: newRefreshToken },
        });
        callback(null, {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      } else {
        callback(null, {
          accessToken: "",
          refreshToken: "",
        });
      }
    } catch (error: Error | any) {
      callback(error, {
        accessToken: "",
        refreshToken: "",
      });
    }
  },
  GetUserInfo: async (
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) => {
    const userId = call.request.userId;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        callback(null, {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } else {
        callback(null, {});
      }
    } catch (error: Error | any) {
      callback(error, {});
    }
  },
};
