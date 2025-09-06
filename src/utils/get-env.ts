
export const getEnv = (key : string, defaultValue?: string): string => {
    const value = process.env[key];
    if(!value) {
        if(defaultValue === undefined) {
            throw new Error(`Environment variable ${key} is not set`);
        }
        return defaultValue;
    }
    return value;
}