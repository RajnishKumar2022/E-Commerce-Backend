import express from "express"

export const orderRouter = express.Router()

orderRouter.post("/register")
orderRouter.post("/login")