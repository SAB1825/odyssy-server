

import { Request, Response } from "express";
import { auth } from "../../utils/auth";
import { fromNodeHeaders } from "better-auth/node";


export const getProfile = async (req : Request, res : Response) => {
    const getSession = await auth.api.getSession({
        headers : fromNodeHeaders(req.headers),
    })
}