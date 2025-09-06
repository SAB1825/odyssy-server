import { SignJWT } from "jose"


export const signJWT = async (
    payload : any,
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
export const generateTokens = async (userId : string, email : string) => {

}