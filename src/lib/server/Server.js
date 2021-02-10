const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

class Server {
  constructor(db) {
    this.db = db;

    this.app = express();

    if (this.app.get("env") === "development") {
      this.app.use(logger("dev"));
    } else {
      this.app.use(logger("common"));
    }

    this.app.use(bodyParser.json());
    this.app.use(cookieParser());

    this.app.get("/healthz", (req, res) => {
      return res.json({ status: "ok" })
    });

    // TODO: This probably isn't needed anymore
    if (this.app.get("env") === "development") {
      this.app.use((err, req, res) => {
        // TODO: ERROR HANDLER
      });
    } else {
      // production error handler
      // no stacktraces leaked to user
      this.app.use((err, req, res) => {
        // TODO: ERROR HANDLER
      });
    }
  }

  run() {
    this.app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`App listenting at http://0.0.0.0:${process.env.PORT}`);
    });
  }
}

module.exports = Server;
