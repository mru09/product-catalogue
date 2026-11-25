import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import app from "./app.js";
await connectDatabase();
app.listen(env.port, () =>
  console.log(`API listening on http://localhost:${env.port}`),
);
