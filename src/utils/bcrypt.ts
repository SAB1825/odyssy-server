import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12;


export const hashValue = async (value : string) => {
    try {
        const hashedvalue = await bcrypt.hash(value, SALT_ROUNDS);
        return hashedvalue;
    } catch (error) {
        throw new Error("Error hashing value");
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