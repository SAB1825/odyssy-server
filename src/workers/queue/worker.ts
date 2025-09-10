import amqplibp from "amqplib";
import { Env } from "../../config/env-config";
import { ICodeExecutionJob } from "../interface";
import { executeCode } from "../../service/code-service";
import { updateCodeSnippet } from "../../service/snippet-service";

let connection: any = null;
let channel: amqplibp.Channel | null = null;
let isProcessing = false;
let isConnected = false;

export async function connectWorker(): Promise<void> {
  if (isConnected) return;

  try {
    connection = await amqplibp.connect(Env.RABBITMQ_URL);
    
    connection.on('error', (err: any) => {
      console.error('[WORKER]: Connection error:', err);
      isConnected = false;
      isProcessing = false;
    });

    connection.on('close', () => {
      console.log('[WORKER]: Connection closed');
      isConnected = false;
      isProcessing = false;
    });

    channel = await connection.createChannel();
    
    channel?.on('error', (err: any) => {
      console.error('[WORKER]: Channel error:', err);
    });

    await channel?.assertQueue(Env.QUEUE_NAME, {
      durable: true,
    });

    await channel?.prefetch(1);

    isConnected = true;
    console.log("🔨 Worker connected to RabbitMQ");
  } catch (error) {
    console.error('[WORKER]: Failed to connect:', error);
    isConnected = false;
    throw error;
  }
}

export const startProcessing = async () => {
  if (!isConnected || !channel || isProcessing) {
    return;
  }

  isProcessing = true;
  console.log("[WORKER]: Worker started processing jobs");

  await channel.consume(Env.QUEUE_NAME, async (msg) => {
    if (!msg || !channel) return;

    const startTime = Date.now();
    let job: ICodeExecutionJob;
    
    try {
      job = JSON.parse(msg.content.toString());
      console.log(`[WORKER]: Processing job ${job.id}...`);

      await updateCodeSnippet(job.id, "processing", "", "0");

      const result = await executeCode(job.code, job.language);

      console.log(result);

      await updateCodeSnippet(
        job.id, 
        result.success ? "completed" : "failed", 
        result.output || result.error || "", 
        result.executionTime.toString()
      );

      channel.ack(msg);
      const totalTime = Date.now() - startTime;

      console.log(`[WORKER]: Job ${job.id} completed in ${totalTime}ms`);
    } catch (error) {
      console.log("[WORKER]: Error processing job", error);
``      
      try {
        if (job!) {
          await updateCodeSnippet(job.id, "failed", `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, "0");
        }
      } catch (updateError) {
        console.log("[WORKER]: Failed to update job status after error", updateError);
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
        console.log("[WORKER] : Error while stopping worker")
    }
}
