import mongoose from "mongoose";

export const connect_to_mongo = () => {
	const connection = mongoose.connection;

	//監聽
	connection.once("open", () => {
		console.log("MongoDB database connection established successfully");
		console.log("The database is " + connection.name);
	});

	//連結
	mongoose.connect(process.env.DB_CONN_STRING, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
	});

	mongoose.set("useFindAndModify", false);
};
