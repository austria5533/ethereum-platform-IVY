import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import AirplanemodeActiveRoundedIcon from "@material-ui/icons/AirplanemodeActiveRounded";
import DriveEtaRoundedIcon from "@material-ui/icons/DriveEtaRounded";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles({
	list: {
		width: 250,
	},
	fullList: {},
	width: "auto",
});

export default function CustomDrawer({ open, toggle_drawer }) {
	const classes = useStyles();
	const history = useHistory();
	const [state, setState] = React.useState(false);

	React.useEffect(() => {
		setState(open);
	}, [open]);
	
	const goToPage = (type) => {
		if (type === 1) {
			history.replace("/houseSearch");
		} else if (type === 2) {
			history.replace("/TrafficPublish");
		}
	};

	const list = (anchor) => (
		<div
			className={clsx(classes.list, {
				[classes.fullList]: anchor === "top" || anchor === "bottom",
			})}
			role="presentation"
			onClick={toggle_drawer}
			onKeyDown={toggle_drawer}
		>
			<List>
				<ListItem button key={0} onClick={(e) => goToPage(1)}>
					<ListItemIcon>
						<AirplanemodeActiveRoundedIcon />
					</ListItemIcon>
					<ListItemText primary={"旅遊區塊鏈平台"} />
				</ListItem>
			</List>
			<List>
				<ListItem button key={1} onClick={(e) => goToPage(2)}>
					<ListItemIcon>
						<DriveEtaRoundedIcon />
					</ListItemIcon>
					<ListItemText primary={"共乘區塊鏈平台"} />
				</ListItem>
			</List>
			<Divider />
		</div>
	);

	return (
		<Drawer anchor={"left"} open={state} onClose={toggle_drawer}>
			{list("left")}
		</Drawer>
	);
}
