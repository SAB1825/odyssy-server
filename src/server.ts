import 'dotenv/config';

import app from './app';
import { Env } from './config/env-config';
import { serverLogger } from './utils/winston';
import { initilizePublisher } from './workers/queue';
import { startWorker } from './workers/script';

const PORT = Env.PORT;

app.listen(PORT, async () => {
  serverLogger.info(`Server running on port ${PORT}`);
  await initilizePublisher();
  await startWorker();
}); 

