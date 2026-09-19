import http from "node:http";
import { createApplication } from "./api/index.js";

async function main() {
  try {
    const server = http.createServer(createApplication());

    const PORT: number = 8080;

    server.listen(PORT, () => {
      console.log(`HTTP Server is running on PORT:${PORT}`);
    });
  } catch (error) {
    console.log(`Error occured while starting the server.`);
    throw error;
  }
}

main();
