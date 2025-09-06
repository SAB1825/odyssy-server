import { Response, Router } from "express";


const route = Router();

route.get("/test", (res : Response) => {
    res.send("Test route is working");
})
export const testRoute = route