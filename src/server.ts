import 'dotenv/config';

import app from './app';
import { Env, ENV_CONFIG } from './config/env-config';

const PORT = Env.PORT;

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
}); 