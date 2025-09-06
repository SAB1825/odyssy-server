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

export const comparePassword = async (password : string, hashedPassword : string) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error("Error comparing password:", error);
    }
}