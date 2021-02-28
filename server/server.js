import express from "express";
import cors from "cors";
import logger from "morgan";
import { connect_to_mongo } from "./mongo";
import userRoute from "./routes/userRoute";

// * 匯入環境變數
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// * 連接資料庫
connect_to_mongo();

// * cors機制處理
app.use(
	cors({
		origin: (origin, callback) => {
			return callback(null, true);
		},
		credentials: true,
	})
);

// * middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));

// * 路由
app.use("/user", userRoute);

// * 啟動server
app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});
