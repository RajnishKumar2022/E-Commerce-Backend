import express from "express"
import type { Express } from "express"
import { adminRouter } from "./admin/admin.route.js";
import { authRouter } from "./auth/auth.route.js";
import { sellerRouter } from "./seller/seller.route.js";


export function createApplication(){
    const app = express()

    app.use(express.json())

    app.use("/api/admin", adminRouter)
    app.use("/api/auth", authRouter)
    app.use("/api/seller", sellerRouter)


    return app
}
