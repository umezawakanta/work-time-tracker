import express, { Request, Response, NextFunction } from "express";
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

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/worktime", workTimeRoutes);
app.use("/api/asset", assetRoutes);
app.use("/api/debt", debtRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/subscription", subscriptionRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res.status(500).json({ message: "Something broke!" });
  }
  next(err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;