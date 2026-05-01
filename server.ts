import { createApp } from "./server/app.js";

async function startServer() {
  const PORT = 3000;
  const app = await createApp();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
