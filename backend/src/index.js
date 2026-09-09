import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


dotenv.config();
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";



const app = express();  

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base test route
app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);


app.use((req, res) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  res.status(404).send(`Route not found: ${req.method} ${req.url}`);
});
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});