import axios from "axios";
import { GEOCODING_API_KEY } from "../config";

export const get_data_from_coordinate = async (coordinate) => {
	const res = await axios.get(
		`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.lat},${coordinate.lon}&key=${GEOCODING_API_KEY}`
	);
	if (res.data.status === "OK") {
		if (res.data.results.length > 0) {
			const {
				formatted_address,
				geometry: { location },
			} = res.data.results[0]; //拿第一個結果
			return {
				address: formatted_address,
				location: [location.lat, location.lng],
			};
		} else {
			return false;
		}
	} else {
		return false;
	}
};

export const get_data_from_address = async (address) => {
	const res = await axios.get(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GEOCODING_API_KEY}`
	);
	if (res.data.status === "OK") {
		if (res.data.results.length > 0) {
			const {
				formatted_address,
				geometry: { location },
			} = res.data.results[0]; //拿第一個結果
			return {
				address: formatted_address,
				location: [location.lat, location.lng],
			};
		} else {
			return false;
		}
	} else {
		return false;
	}
};
