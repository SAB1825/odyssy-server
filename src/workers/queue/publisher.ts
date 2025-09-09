import { v4 as uuid } from "uuid";
import { ICodeExecutionJob, ICodePublisherData } from "../interface";
import { Env } from "../../config/env-config";
import amqplibp from "amqplib";

let connection: any = null;
let channel: amqplibp.Channel | null = null;
let isConnected = false;

export async function QueuePublisher(): Promise<void> {
  if (isConnected) return;

  try {
    connection = await amqplibp.connect(Env.RABBITMQ_URL);
    
    connection.on('error', (err: any) => {
      console.error('[PUBLISHER]: Connection error:', err);
      isConnected = false;
    });

    connection.on('close', () => {
      console.log('[PUBLISHER]: Connection closed');
      isConnected = false;
    });

    channel = await connection.createChannel();
    
    channel?.on('error', (err: any) => {
      console.error('[PUBLISHER]: Channel error:', err);
    });

    await channel?.assertQueue(Env.QUEUE_NAME, {
      durable: true,
    });

    isConnected = true;
    console.log("🔨 Publisher connected to RabbitMQ");
  } catch (error) {
    console.error('[PUBLISHER]: Failed to connect:', error);
    isConnected = false;
    throw error;
  }
}

export const publishCodeExecution = async (codeData: ICodePublisherData) => {
  if (!isConnected || !channel) {
    throw new Error("Publisher not connected to RabbitMQ");
  }
  
  const jobId = uuid();
  const job: ICodeExecutionJob = {
    id: jobId,
    userId: codeData.userId,
    code: codeData.code,
    language: codeData.language,
    codeSnippetId: codeData.code_snippet_id,
    timestamp: new Date(),
  };

  try {
    const sent = channel.sendToQueue(
      Env.QUEUE_NAME,
      Buffer.from(JSON.stringify(job)),
      {
        persistent: true,
        messageId: jobId,
      }
    );
    
    if (!sent) {
      throw new Error("Failed to publish job to the queue");
    }
    
    console.log(`[PUBLISHER]: Job ${jobId} published to queue`);
    return jobId;
  } catch (error) {
    console.error('[PUBLISHER]: Error publishing job:', error);
    throw new Error("Failed to publish job to the queue");
  }
};
