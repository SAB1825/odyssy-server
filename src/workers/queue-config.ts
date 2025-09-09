import { Env } from "../config/env-config";
import amqlibp from "amqplib";
export const QUEUE_CONFIG = {
  MAIN_QUEUE: Env.QUEUE_NAME,
  DLQ: `${Env.QUEUE_NAME}.dlq`,
  DLX: `${Env.QUEUE_NAME}.dlx`,
  RETRY_QUEUE: `${Env.QUEUE_NAME}.retry`,
  MAX_RETRIES: 3,
  RETRY_DELAY: 30000, 
};

// Updated queue setup with DLQ
export const setupQueues = async (channel: amqlibp.Channel) => {
  // Setup dead letter exchange
  await channel.assertExchange(QUEUE_CONFIG.DLX, 'direct', { durable: true });
  
  // Setup main queue with DLQ
  await channel.assertQueue(QUEUE_CONFIG.MAIN_QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': QUEUE_CONFIG.DLX,
      'x-dead-letter-routing-key': 'failed'
    }
  });
  
  // Setup dead letter queue
  await channel.assertQueue(QUEUE_CONFIG.DLQ, { durable: true });
  await channel.bindQueue(QUEUE_CONFIG.DLQ, QUEUE_CONFIG.DLX, 'failed');
  
  // Setup retry queue
  await channel.assertQueue(QUEUE_CONFIG.RETRY_QUEUE, {
    durable: true,
    arguments: {
      'x-message-ttl': QUEUE_CONFIG.RETRY_DELAY,
      'x-dead-letter-exchange': '',
      'x-dead-letter-routing-key': QUEUE_CONFIG.MAIN_QUEUE
    }
  });
};
