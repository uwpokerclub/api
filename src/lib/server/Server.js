const express = require("express");
const { join } = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const { json } = require("body-parser");

const APIRouteHandler = require("../../routes/api");

class Server {
  constructor(db) {
    this.db = db;

    this.app = express();

    if (this.app.get("env") === "development") {
      this.app.use(logger("dev"));
    } else {
      this.app.use(logger("common"));
    }

    this.app.use(json());
    this.app.use(cookieParser());

    this.app.use(express.static(join(__dirname, "../../../build")));

    const apiRoute = new APIRouteHandler("/api", this.db);

    this.app.get("/healthz", (req, res) => res.json({ status: "ok" }));

    this.app.use(apiRoute.path, apiRoute.handler());

    this.app.get("/*", (req, res) => {
      res.sendFile(join(__dirname, "../../../build", "index.html"));
    });
  }

  run() {
    this.app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`App listenting at http://0.0.0.0:${process.env.PORT}`);
    });
  }
}

module.exports = Server;
