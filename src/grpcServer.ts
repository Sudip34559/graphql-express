import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { getEnv } from "./lib/env";
import { authService } from "./controllers/grpc.controller";

export const grpcInit = (server: grpc.Server) => {
  const packageDefinition = protoLoader.loadSync("proto/auth.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const authProto = grpc.loadPackageDefinition(packageDefinition).auth as any;

  server.addService(authProto.AuthService.service, authService);

  server.bindAsync(
    `0.0.0.0:${getEnv("GRPC_PORT")}`,
    grpc.ServerCredentials.createInsecure(),
    (err: Error | null, port: number) => {
      if (err) {
        console.error("gRPC server binding error:", err);
        return;
      }
      console.log(`gRPC Server is running on http://localhost:${port}`);
    }
  );
};
