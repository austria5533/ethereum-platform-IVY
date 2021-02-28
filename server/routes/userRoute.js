import { Router } from "express";
import User from "../models/userModel";

const router = Router();

const get_user = async (req, res) => {
	const { uid } = req.query;
	const user = await User.findById(uid).exec();
	res.json(user);
};

router.route("/:uid").get(get_user);

export default router;
