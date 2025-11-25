import "dotenv/config";
import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import bodyParser from "body-parser";
import { resolvers } from "./src/resolver/resolvers.js";
import { readFileSync } from "fs";
import { context } from "./src/middlewares/auth.middleware";
import cookieParser from "cookie-parser";
const typeDefs = readFileSync("./src/schema/schema.graphql", {
  encoding: "utf-8",
});

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  await server.start();
  app.use("/graphql", expressMiddleware(server, { context }));

  app.listen(4000, () => {
    console.log("Server is running on http://localhost:4000/graphql");
  });
}

startServer();
