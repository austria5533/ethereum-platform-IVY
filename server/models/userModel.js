import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		ethereum_account: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema, "user");

export default User;
