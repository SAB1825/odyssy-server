import { Request, Response } from "express";
import { getUserById } from "../../service/auth-service";

export const getUser = async(req: Request, res : Response) => {
    const userId = req.userId;

    try {
        const user = await getUserById(userId as string);

        res.status(200).json({ user });
    } catch (error : any) {
        console.error("Error fetching user:", error);
        throw error
    }
}