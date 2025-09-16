
  import amqp from 'amqplib';
  import { CodeExecutionJob, JobResult, ConnectionState } from '../interface';
  import { Env } from '../../config/env-config';
  import { workerLogger } from '../../utils/winston';
  import { executeCode } from '../../service/code-service';
  import { generateCodeHash } from '../../utils/crypto';
  import { setCodeCache } from '../../service/cache-sevice';
import { notifyJobCompletion } from '../../utils/websocket';

  let workerState: ConnectionState & { isProcessing: boolean } = {
    connection: null,
    channel: null,
    isConnected: false,
    isProcessing: false
  };

  export const connectWorker = async (): Promise<void> => {
    try {
      if (workerState.isConnected) return;

      workerState.connection = await amqp.connect(Env.RABBITMQ_URL);
      workerState.channel = await workerState.connection.createChannel();
      
      await workerState.channel.assertQueue(Env.QUEUE_NAME, {
        durable: true
      });

      await workerState.channel.prefetch(1);

      workerState.isConnected = true;
      workerLogger.info('Worker connected to RabbitMQ');
    } catch (error) {
      workerLogger.error('Worker connection failed:', error);
      throw error;
    }
  };

  export const startProcessing = async (): Promise<void> => {
    if (!workerState.isConnected || !workerState.channel || workerState.isProcessing) {
      return;
    }

    workerState.isProcessing = true;
    workerLogger.info(' Worker started processing jobs...');

    await workerState.channel.consume(Env.QUEUE_NAME, async (msg : any) => {
      if (!msg) return;

      const startTime = Date.now();
      let job: CodeExecutionJob;

      try {
        job = JSON.parse(msg.content.toString());
        console.log(`Processing job ${job.id} for user ${job.userId}`);

        const result = await executeJob(job);

        await storeResult(result);

        workerState.channel?.ack(msg);
        
        const totalTime = Date.now() - startTime;
        workerLogger.info(`Job ${job.id} completed in ${totalTime}ms`);

      } catch (error) {
        console.error(`Job processing failed:`, error);
        
        if (job!) {
          await storeFailedResult(job.id, error);
        }

        workerState.channel?.nack(msg, false, false);
      }
    });
  };

  const executeJob = async (job: CodeExecutionJob): Promise<JobResult> => {
    const result = await executeCode(
      job.code,
      job.language
    );

    return {
      code : job.code,
      jobId: job.id,
      language : job.language,
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      completedAt: new Date()
    };
  };

  const storeResult = async (result: JobResult): Promise<void> => {
    try {
      workerLogger.info(`Storing result for job ${result.jobId}`);

      const codeHash = await generateCodeHash(result.code, result.language);

      await setCodeCache(
        {
          codeHash ,
          executionTime : result.executionTime,
          error : result.error || undefined,
          output : result.output,
          success : true,
          status : "COMPLETED"
        }
      )
      await notifyJobCompletion({
        jobId : result.jobId,
        executionTime : result.executionTime,
        error : result.error || undefined,
        output : result.output,
        success : true,
        status : "COMPLETED"
      })

    } catch (error) {
      workerLogger.error('Failed to store result:', error);
      throw error; 
    }
  };

  const storeFailedResult = async (jobId: string, error: any): Promise<void> => {
    try {
      workerLogger.info(`Storing failed result for job ${jobId}`);
      
    } catch (dbError) {
      workerLogger.error('Failed to store failed result:', dbError);
    }
  };

  export const stopProcessing = async (): Promise<void> => {
    workerState.isProcessing = false;
    workerLogger.info('Worker stopped processing');
  };

  export const closeWorker = async (): Promise<void> => {
    try {
      await stopProcessing();
      if (workerState.channel) await workerState.channel.close();
      if (workerState.connection) await workerState.connection.close();
      workerState = {
        connection: null,
        channel: null,
        isConnected: false,
        isProcessing: false
      };
      workerLogger.info('Worker disconnected');
    } catch (error) {
      workerLogger.error('Error closing worker:', error);
    }
  };

  export const getWorkerState = () => ({ ...workerState });