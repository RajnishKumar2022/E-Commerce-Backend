import express from "express"

export const productRouter = express.Router()

productRouter.post("/register")
productRouter.post("/login")