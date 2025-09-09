import 'dotenv/config';

import app from './app';
import { Env, ENV_CONFIG } from './config/env-config';
import { connectWorker, startProcessing } from './workers/queue/worker';
import { QueuePublisher } from './workers/queue/publisher';

const PORT = Env.PORT;

app.listen(PORT, async () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
  await connectWorker();
  await QueuePublisher();
  await startProcessing();
}); 

