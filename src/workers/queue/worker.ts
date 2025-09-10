import amqplibp from "amqplib";
import { Env } from "../../config/env-config";
import { ICodeExecutionJob } from "../interface";
import { executeCode } from "../../service/code-service";
import { updateCodeSnippet } from "../../service/snippet-service";
import { workerLogger } from "../../utils/winston";

let connection: any = null;
let channel: amqplibp.Channel | null = null;
let isProcessing = false;
let isConnected = false;

export async function connectWorker(): Promise<void> {
  if (isConnected) return;

  try {
    connection = await amqplibp.connect(Env.RABBITMQ_URL);
    
    connection.on('error', (err: any) => {
      workerLogger.error("Connection error:", err);
      isConnected = false;
      isProcessing = false;
    });

    connection.on('close', () => {
      workerLogger.info('Connection closed');
      isConnected = false;
      isProcessing = false;
    });

    channel = await connection.createChannel();
    
    channel?.on('error', (err: any) => {
      workerLogger.error('Channel error:', err);
    });

    await channel?.assertQueue(Env.QUEUE_NAME, {
      durable: true,
    });

    await channel?.prefetch(1);

    isConnected = true;
    workerLogger.info("🔨 Worker connected to RabbitMQ");
  } catch (error) {
    workerLogger.error('Failed to connect:', error);
    isConnected = false;
    throw error;
  }
}

export const startProcessing = async () => {
  if (!isConnected || !channel || isProcessing) {
    return;
  }

  isProcessing = true;
  workerLogger.info("Worker started processing jobs");

  await channel.consume(Env.QUEUE_NAME, async (msg) => {
    if (!msg || !channel) return;

    const startTime = Date.now();
    let job: ICodeExecutionJob;
    
    try {
      job = JSON.parse(msg.content.toString());
      workerLogger.info(`[WORKER]: Processing job ${job.id}...`);
      await updateCodeSnippet(job.id, "processing", "", "0");

      const result = await executeCode(job.code, job.language);

      await updateCodeSnippet(
        job.id, 
        result.success ? "completed" : "failed", 
        result.output || result.error || "", 
        result.executionTime.toString()
      );

      channel.ack(msg);
      const totalTime = Date.now() - startTime;

      workerLogger.info(`Job ${job.id} completed in ${totalTime}ms`);
    } catch (error) {
      workerLogger.error("Error processing job:", error);
      try {
        if (job!) {
          await updateCodeSnippet(job.id, "failed", `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, "0");
        }
      } catch (updateError) {
        workerLogger.error("[WORKER]: Failed to update job status after error", updateError);
      }
      
      channel.nack(msg, false, false);
    }
  });
};

export const closeWorker = async () => {

    try {
        await channel?.close()
        isProcessing = false;
        isConnected = false;
    } catch (error) {
        workerLogger.error("Error while stopping worker:", error);
    }
}
