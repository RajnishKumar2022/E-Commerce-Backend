import { z } from "zod"

export const signupPayloadModel = z.object({
    firstName: z.string().min(3).max(50),
    lastName: z.string().min(3).max(30).nullable().optional(),
    email: z.email(),
    password: z.string().min(6).max(66)
})


export const signinPayloadModel = z.object({
    email: z.email(),
    password: z.string().min(6).max(66)
})