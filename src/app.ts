import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Request, Response } from "express";
import { authRoutes } from "./routes/auth-route";
import { codeRoutes } from "./routes/code-route";
import { errorHandler } from "./middlewares/error-handler";
import { createServer } from "http";
import  {WebSocketServer} from "ws";
import { webSocketLogger } from "./utils/winston";
import { apiRoute } from "./routes/api-route";

dotenv.config();
const app = express();

const server = createServer(app);
const wss = new WebSocketServer({ server });
const jobSubscriptions: Record<string, any> = {};


wss.on("connection", (ws, req) => {
  webSocketLogger.info("New WebSocket connection established");
  
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      webSocketLogger.info("Received WebSocket message:", data);
      
      if(data.type === "subscribe" && data.jobId) {
        jobSubscriptions[data.jobId] = ws; 
        webSocketLogger.info(`Subscribed to job ${data.jobId}`);
        
        ws.send(JSON.stringify({
          type: "subscription_confirmed",
          jobId: data.jobId,
          message: "Successfully subscribed to job updates"
        }));
      }
    } catch (error) {
      webSocketLogger.error("Error parsing WebSocket message:", error);
      ws.send(JSON.stringify({
        type: "error",
        message: "Invalid message format"
      }));
    }
  });

  ws.on("close", () => {
    webSocketLogger.info("WebSocket connection closed");
    Object.keys(jobSubscriptions).forEach(jobId => {
      if (jobSubscriptions[jobId] === ws) {
        delete jobSubscriptions[jobId];
        webSocketLogger.info(`Removed subscription for job ${jobId}`);
      }
    });
  });

  ws.on("error", (error) => {
    webSocketLogger.error("WebSocket error:", error);
  });

  ws.send(JSON.stringify({
    type: "connection_established",
    message: "WebSocket connection successful"
  }));
});
//ALLOW ALL CORS 
app.use(cors({
  origin: "*",
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"]
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).send("API is healthy");
});

app.get("/api/websocket/status", (req: Request, res: Response) => {
  const activeConnections = Object.keys(jobSubscriptions).length;
  res.status(200).json({
    websocket_server: "running",
    active_subscriptions: activeConnections,
    subscription_details: Object.keys(jobSubscriptions)
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/code", codeRoutes);
app.use("/api/v1/api-key", apiRoute)


app.use(errorHandler);

export default app;
export { server, wss, jobSubscriptions };