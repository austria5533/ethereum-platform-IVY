import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { useHistory, useLocation } from "react-router-dom";
import { bytes32_to_string } from "../utils/tools";

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
		cursor: "pointer",
		"&:hover": {
			opacity: 0.5,
		},
	},
}));

export default function CustomAppBar({ toggle_drawer }) {
	const classes = useStyles();
	const history = useHistory();

	//取得使用者
	const get_user = () => {
		const user = localStorage.getItem("user");
		if (user) {
			let data = JSON.parse(user);
			return bytes32_to_string(data.uid);
		} else {
			return "無使用者";
		}
	};

	const toggle_home = () => {
		history.push("/home");
	};

	const toggle_login = () => {
		history.push("/login");
	};

	const toggle_logout = () => {
		localStorage.removeItem("user");
		document.location.reload();
	};

	return (
		<div className={classes.root}>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						edge="start"
						className={classes.menuButton}
						color="inherit"
						aria-label="menu"
						onClick={toggle_drawer}
					>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" className={classes.title} onClick={toggle_home}>
						{`區塊鏈整合平台【${get_user()}】`}
					</Typography>
					<Button color="inherit" onClick={toggle_login}>
						{"登入"}
					</Button>
					<Button color="inherit" onClick={toggle_logout}>
						{"登出"}
					</Button>
				</Toolbar>
			</AppBar>
		</div>
	);
}
