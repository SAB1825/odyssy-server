import z from "zod";


export const registerSchema = z.object({
    name : z.string().min(2).max(100, "Name must be between 2 and 100 characters"),
    email : z.email("Invalid email address"),
    password : z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be at most 100 characters"),
})

export const loginSchema = z.object({
    email : z.email("Invalid email address"),
    password : z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be at most 100 characters"),
})

export const verifyEmailSchema = z.object({
    token: z.string().min(1, "Token is required"),
    email: z.email("Invalid email address"),   
})

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    email: z.email("Invalid email address"),   
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be at most 100 characters"),
}) 