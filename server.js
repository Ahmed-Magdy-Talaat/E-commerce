import express from "express";
import session from "express-session";
import authRouter from "./modules/auth/auth.routes.js";
import categoryRouter from "./modules/category/category.routes.js";
import brandRouter from "./modules/brand/brand.routes.js";
import productRouter from "./modules/product/product.routes.js";
import couponRouter from "./modules/coupon/coupon.routes.js";
import cartRouter from "./modules/cart/cart.routes.js";
import reviewRouter from "./modules/review/review.routes.js";
import orderRouter from "./modules/order/order.routes.js";

import dotenv from "dotenv";
import { connectDB } from "./DB/DB.connection.js";
import { globalResponse } from "./middlewares/globalResponse.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Configure express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Secret used to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
  })
);

const port = process.env.PORT || 3000;

// Mount the authentication router
app.use("/api/v1", authRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/brand", brandRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/order", orderRouter);
// Global error handling middleware
app.use(globalResponse);

// Start the server
app.listen(port, () => console.log(`App is listening on port ${port}`));
