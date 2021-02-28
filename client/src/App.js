import React from "react";
import AppBar from "./components/AppBar";
import CustomDrawer from "./components/Drawer";
import { Route, Switch } from "react-router-dom";
import { routes } from "./routes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.scss";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
	iconUrl: icon,
	shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function App() {
	const [open, set_open] = React.useState(false);

	const toggle_drawer = () => {
		set_open(!open);
	};

	return (
		<React.Fragment>
			<AppBar toggle_drawer={toggle_drawer} />
			<Switch>
				{routes.map((item, i) => {
					return (
						<Route
							exact={i === 0}
							key={i}
							path={item.path}
							component={item.component}
						/>
					);
				})}
			</Switch>
			<CustomDrawer open={open} toggle_drawer={toggle_drawer} />
		</React.Fragment>
	);
}

export default App;
