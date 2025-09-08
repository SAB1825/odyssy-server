import { SignJWT, jwtVerify } from "jose"

interface JWTPayload {
    email : string;
    [key: string]: any; // Add index signature for jose compatibility
}


export const signJWT = async (
    payload : JWTPayload,
    secret : string,
    expiresIn : number = 3600
) : Promise<string> => {
    
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
        .sign(new TextEncoder().encode(secret))

    return jwt
}

export const verifyJWT = async (
    token : string,
    secret : string
) => {
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))  as {payload : JWTPayload};
        return payload;
    } catch (error) {
        throw new Error("Invalid token");
    }
}
