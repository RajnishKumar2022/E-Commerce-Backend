import express from "express";
import * as authController from "./auth.controller.js";
import {
  authenticationMiddleware,
  restrictToAuthenticateUser,
} from "./auth.middleware.js";

export const authRouter = express.Router();

authRouter.get("/health", (req, res) => {
  res.send("All good, Server is healthy and you are on authRouter page");
});

authRouter.post("/register", authController.registerUser); // Naya account banane ke liye.
authRouter.post("/login", authController.loginUser); //  Login karne ke liye.

authRouter.get(
  "/logout",
  authenticationMiddleware(),
  authController.logoutUser,
);
authRouter.get(
  "/me",
  authenticationMiddleware(),
  restrictToAuthenticateUser(),
  authController.getMe,
);

authRouter.get("/products", authController.getAllProducts) // Saare products aur filters load karne ke liye (Home/Listing page par).

authRouter.get("/products/:id", authController.getProductById) // Kisi ek product ki detail fetch karne ke liye.


authRouter.get("/cart", authenticationMiddleware(), restrictToAuthenticateUser(), authController.getCartData) // Cart ka data dekhne ke liye

// authRouter.post("/cart/add") // Cart ka data dekhne aur naya item add karne ke liye.

// authRouter.post("/orders/place") // Naya order create karne ke liye.

// authRouter.get("/orders/user") // Customer ko uske purane orders dikhane ke liye.
