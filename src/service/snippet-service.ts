import e from "express";
import { db } from "../db";
import { savedCodes } from "../db/schema";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";

interface creatCodeData {
  language: string;
  code: string;
  status: string;
  userId: string;
  jobId: string;
}

export const createCodeSnippet = async (data: creatCodeData) => {
  try {
    const codeSnippet = await db.insert(savedCodes).values({
      id: uuid(),
      language: data.language,
      code: data.code,
      userId: data.userId,
      jobId: data.jobId,
    }).returning();
    return codeSnippet
  } catch (error) {
    console.log("Something went wrong when creating code snippet")
  }
};

export const updateCodeSnippet = async (jobId : string, status: string, output: string, timeTaken: string) => {
  try {
    const updatedSnippet = await db.update(savedCodes).set({
      status : status,
      output: output,
      timeTaken: timeTaken
    }).where(eq(savedCodes.jobId, jobId)).returning();
    
    return updatedSnippet; // Return the actual result, not the function
  } catch (error) {
    console.log("Error updating code snippet:", error);
    throw error; // Re-throw the error instead of just logging
  }
}