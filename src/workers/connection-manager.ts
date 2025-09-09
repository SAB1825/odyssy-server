import amqplib from "amqplib";
import { Env } from "../config/env-config";

class ConnectionManager {
  private connection: any = null;
  private publisherChannel: amqplib.Channel | null = null;
  private workerChannel: amqplib.Channel | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;

  async connect(): Promise<void> {
    try {
      this.connection = await amqplib.connect(Env.RABBITMQ_URL);
      
      this.connection.on('error', (err: any) => {
        console.error('[CONNECTION]: Connection error:', err);
        this.handleConnectionLoss();
      });

      this.connection.on('close', () => {
        console.log('[CONNECTION]: Connection closed');
        this.handleConnectionLoss();
      });

      await this.createChannels();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log("🔨 Connected to RabbitMQ");
    } catch (error) {
      console.error('[CONNECTION]: Failed to connect:', error);
      await this.handleReconnection();
    }
  }

  private async createChannels(): Promise<void> {
    this.publisherChannel = await this.connection.createChannel();
    this.workerChannel = await this.connection.createChannel();

    await this.publisherChannel?.assertQueue(Env.QUEUE_NAME, { durable: true });
    await this.workerChannel?.assertQueue(Env.QUEUE_NAME, { durable: true });
    await this.workerChannel?.prefetch(1);

    this.publisherChannel?.on('error', (err: any) => {
      console.error('[CONNECTION]: Publisher channel error:', err);
    });

    this.workerChannel?.on('error', (err: any) => {
      console.error('[CONNECTION]: Worker channel error:', err);
    });
  }

  private handleConnectionLoss(): void {
    this.isConnected = false;
    this.publisherChannel = null;
    this.workerChannel = null;
    this.handleReconnection();
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[CONNECTION]: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[CONNECTION]: Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  getPublisherChannel(): amqplib.Channel | null {
    return this.publisherChannel;
  }

  getWorkerChannel(): amqplib.Channel | null {
    return this.workerChannel;
  }

  isConnectionReady(): boolean {
    return this.isConnected && !!this.publisherChannel && !!this.workerChannel;
  }

  async close(): Promise<void> {
    try {
      await this.publisherChannel?.close();
      await this.workerChannel?.close();
      await this.connection?.close();
      this.isConnected = false;
    } catch (error) {
      console.error('[CONNECTION]: Error closing connection:', error);
    }
  }
}

export const connectionManager = new ConnectionManager();
