import { workerLogger } from "../utils/winston";
import { closeAllConnections, initializeWorker } from "./queue";


let isShuttingDown = false;

const startWorker = async (): Promise<void> => {
  try {
    workerLogger.info('Starting worker process...');
    
    await initializeWorker();
    
    workerLogger.info('Worker process started successfully');
    
    setupShutdownHandlers();
    
  } catch (error) {
    workerLogger.error('Failed to start worker process:', error);
    process.exit(1);
  }
};

const setupShutdownHandlers = (): void => {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    
    workerLogger.info(`Received ${signal}, shutting down worker gracefully...`);
    isShuttingDown = true;

    try {
      await closeAllConnections();
      workerLogger.info('Worker shutdown complete');
      process.exit(0);
    } catch (error) {
      workerLogger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));

  process.on('uncaughtException', (error) => {
    workerLogger.error('Uncaught Exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    workerLogger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
};

if (require.main === module) {
  startWorker().catch((error) => {
    workerLogger.error('Worker startup failed:', error);
    process.exit(1);
  });
}

export { startWorker };