import express from "express"
import type { Express } from "express"
import { adminRouter } from "./admin/admin.route.js";
import { authRouter } from "./auth/auth.route.js";
import { sellerRouter } from "./seller/seller.route.js";
import { success } from "zod";


export function createApplication(){
    const app = express()

    app.use(express.json())

    // app.use("/api/admin", adminRouter)
    app.use("/api/auth", authRouter)
    // app.use("/api/seller", sellerRouter)

    app.get("/", (req, res) => {
        res.json({
            success: true,
            message: "All good, Server is healthy"
        })
    })
    return app
}
