import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12;


export const hashPassword = async (password : string) => {
    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        return hashedPassword;
    } catch (error) {
        throw new Error("Error hashing password");
    }
}