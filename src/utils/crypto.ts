import crypto from 'crypto';


export const generateCodeHash = (code: string, language: string): string => {
  return crypto.createHash('sha256').update(`${language}:${code}`).digest('hex');
};

export const generateAPIToken = (length : number) => {
  return crypto.randomBytes(length).toString("hex")
}