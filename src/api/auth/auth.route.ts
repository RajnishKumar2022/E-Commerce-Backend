import express from "express"

export const authRouter = express.Router()

authRouter.post("/register") // Naya account banane ke liye.
authRouter.post("/login") //  Login karne ke liye.

// authRouter.get("/me")

authRouter.get("/products") // Saare products aur filters load karne ke liye (Home/Listing page par).
authRouter.get("/products/:id") // Kisi ek product ki detail fetch karne ke liye.
authRouter.get("/cart") // Cart ka data dekhne aur naya item add karne ke liye.


authRouter.post("/cart/add") // Cart ka data dekhne aur naya item add karne ke liye.

authRouter.post("/orders/place") // Naya order create karne ke liye.

authRouter.get("/orders/user") // Customer ko uske purane orders dikhane ke liye.