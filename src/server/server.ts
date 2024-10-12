import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/database.js";
import workTimeRoutes from "./routes/workTimeRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import debtRoutes from "./routes/debtRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import sleepTrackerRoutes from "./routes/sleepTrackerRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/worktime", workTimeRoutes);
app.use("/api/asset", assetRoutes);
app.use("/api/debt", debtRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/withdrawal", withdrawalRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/sleep-records", sleepTrackerRoutes);

// Not Found middleware
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Resource not found" });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;