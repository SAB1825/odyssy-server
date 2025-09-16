import 'dotenv/config';

import { server } from './app'; // Import the HTTP server instead of Express app
import { Env } from './config/env-config';
import { serverLogger } from './utils/winston';
import { initilizePublisher } from './workers/queue';
import { startWorker } from './workers/script';

const PORT = Env.PORT;

server.listen(PORT, async () => {
  serverLogger.info(`Server with WebSocket running on port ${PORT}`);
  serverLogger.info(`WebSocket endpoint: ws://localhost:${PORT}`);
  await initilizePublisher();
  await startWorker();
}); 

