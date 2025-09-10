import 'dotenv/config';

import app from './app';
import { Env, ENV_CONFIG } from './config/env-config';
import { connectWorker, startProcessing } from './workers/queue/worker';
import { QueuePublisher } from './workers/queue/publisher';
import { serverLogger } from './utils/winston';

const PORT = Env.PORT;

app.listen(PORT, async () => {
  serverLogger.info(`🚀 Server running on port ${PORT}`);
  await connectWorker();
  await QueuePublisher();
  await startProcessing();
}); 

