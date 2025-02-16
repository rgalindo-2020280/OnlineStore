import { connect } from "./configs/mongo.js";
import { config } from "dotenv";
import { initServer } from "./configs/app.js";

config()
initServer()
connect()