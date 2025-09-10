
import amqp from 'amqplib';
import { v4 as uuid } from 'uuid';
import { CodeExecutionJob, ConnectionState } from '../interface';
import { Env } from '../../config/env-config';
import { publisherLogger } from '../../utils/winston';

let publisherState: ConnectionState = {
  connection: null,
  channel: null,
  isConnected: false
};

export const connectPublisher = async (): Promise<void> => {
  try {
    if (publisherState.isConnected) return;

    publisherState.connection = await amqp.connect(Env.RABBITMQ_URL);
    publisherState.channel = await publisherState.connection.createChannel();
    
    await publisherState.channel.assertQueue(Env.QUEUE_NAME, {
      durable: true
    });
    
    publisherState.isConnected = true;
    publisherLogger.info("Publisher connected to RabbitMQ");
  } catch (error) {
    publisherLogger.error('Publisher connection failed:', error);
    throw error;
  }
};

export const publishCodeExecution = async (
  userId: string,
  code: string,
  language: string,
  codeSnippetId?: string
): Promise<string> => {
  if (!publisherState.isConnected || !publisherState.channel) {
    throw new Error('Publisher not connected');
  }

  const jobId = uuid();
  const job: CodeExecutionJob = {
    id: jobId,
    userId,
    code,
    language,
    codeSnippetId,
    timestamp: Date.now()
  };

  const sent = publisherState.channel.sendToQueue(
    Env.QUEUE_NAME,
    Buffer.from(JSON.stringify(job)),
    {
      persistent: true,
      messageId: jobId
    }
  );

  if (!sent) {
    throw new Error('Failed to send job to queue');
  }

  publisherLogger.info(`Job ${jobId} queued for user ${userId}`);
  return jobId;
};

export const closePublisher = async (): Promise<void> => {
  try {
    if (publisherState.channel) await publisherState.channel.close();
    if (publisherState.connection) await publisherState.connection.close();
    publisherState = {
      connection: null,
      channel: null,
      isConnected: false
    };
    publisherLogger.info('Publisher disconnected');
  } catch (error) {
    publisherLogger.error('Error closing publisher:', error);
  }
};

export const getPublisherState = () => ({ ...publisherState });