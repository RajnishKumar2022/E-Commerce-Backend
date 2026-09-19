import http from "node:http";
import { createApplication } from "./src/index.js";
async function main() {
    try {
        const server = http.createServer(createApplication());
        const PORT = 8080;
        server.listen(PORT, () => {
            console.log(`HTTP Server is running on PORT:${PORT}`);
        });
    }
    catch (error) {
        console.log(`Error occured while starting the server.`);
        throw error;
    }
}
main();
//# sourceMappingURL=index.js.map