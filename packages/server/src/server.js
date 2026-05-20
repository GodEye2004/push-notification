const http = require("http");
const { app } = require("./app");
const { initSocket } = require("./socket");
require("./config/db");

const server = http.createServer(app);
initSocket(server);

const port = process.env.PORT || 5001;
server.listen(port, "0.0.0.0", () =>
  console.log(`[Server] Running on http://0.0.0.0:${port}`),
);
