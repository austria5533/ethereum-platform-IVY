import { bytes32_to_string } from "./tools";
import { getContractInstance, contract_call } from "./getContract";
import Announce from '../contracts/Announce.json'
import announceManager from '../contracts/AnnounceManager.json'
import TrafficTransaction from '../contracts/TrafficTransaction.json'

//取得所有貼文
export const get_all_announce_info= async (announceManager) => {
	let result = [];
	let all_traffic_data = await announceManager.methods.get_all_announces().call({
		gas: 6000000,
	});
	for (let i = 0; i < all_traffic_data[1].length; i++) {
		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
		let traffic_addr = all_traffic_data[1][i]; //ownable addr
		let traffic_data = await announceManager.methods.get_announce(all_traffic_data[0][i]).call();
		let traffic_data_destination = await announceManager.methods.get_announce_destination(all_traffic_data[0][i]).call();
		let owner = bytes32_to_string(all_traffic_data[0][i]); //random id
		//let announce =  traffic_data[0];
		let name =  bytes32_to_string(traffic_data[0]);
		let dates = parseInt(traffic_data[1]);
		let traffic = bytes32_to_string(traffic_data[2]);
		let people = parseInt(traffic_data[3]);
		let people_count = parseInt(traffic_data[4]);
		let money = parseInt(traffic_data[5]);
		let departure_lon = bytes32_to_string(traffic_data_destination[0]);
		let departure_lat = bytes32_to_string(traffic_data_destination[1]);
		let destination_lon = bytes32_to_string(traffic_data_destination[2]);
		let destination_lat = bytes32_to_string(traffic_data_destination[3]);
		let u = traffic_data_destination[4];
		result.push({
			traffic_id,
			traffic_addr,
			//announce,
			owner,
			name,
			dates,
			money,
			people,
			people_count,
			traffic,
			departure_lon,
			departure_lat,
			destination_lon,
			destination_lat,
			u
		});
	}
	return result;
};

export const get_user_all_announce_info = async(announceManager, user_addr) => {
	let result = [];
	let user_announce_id_list = await announceManager.methods.get_user_all_announce(user_addr).call();
	for (let i = 0; i < user_announce_id_list[1].length; i++) {
		let announce_id = bytes32_to_string(user_announce_id_list[0][i]);
		let announce_addr = user_announce_id_list[1][i]; //ownable addr
		let announce_data = await announceManager.methods.get_announce(user_announce_id_list[0][i]).call();
		let announce_data_destination = await announceManager.methods.get_announce_destination(user_announce_id_list[0][i]).call();
		let announce_data_total_money = await announceManager.methods.get_announce_total_money(user_announce_id_list[0][i]).call();
		console.log(announce_data_total_money)
		let owner = bytes32_to_string(user_announce_id_list[0][i]); //random id
		let name =  bytes32_to_string(announce_data[0]);
		let dates = parseInt(announce_data[1]);
		let traffic = bytes32_to_string(announce_data[2]);
		let people = parseInt(announce_data[3]);
		let people_count = parseInt(announce_data[4]);
		let money = parseInt(announce_data[5]);
		let departure_lon = bytes32_to_string(announce_data_destination[0]);
		let departure_lat = bytes32_to_string(announce_data_destination[1]);
		let destination_lon = bytes32_to_string(announce_data_destination[2]);
		let destination_lat = bytes32_to_string(announce_data_destination[3]);
		let u = announce_data_destination[4];
		let total_money = announce_data_total_money;
		result.push({
			announce_id,
			announce_addr,
			//announce,
			owner,
			name,
			dates,
			money,
			people,
			people_count,
			traffic,
			departure_lon,
			departure_lat,
			destination_lon,
			destination_lat,
			u,
			total_money
		});
	}
	return result;
}


//取得登入使用者所有文章
export const get_all_user_info= async (web3, announce_list, user) => {
	let result = [];
	for(let i = 0; i < announce_list.length; i++) {
		let announce_instance = await getContractInstance(web3, Announce, announce_list[i].traffic_addr);
		let user_addr = await announce_instance.methods.get_u().call();
		if(user_addr === user.address) {
			result.push(announce_list[i]);
		}
	}
	return result;
};



//取得所有使用者相關貼文
export const get_user_all_announce_info_paymoney = async(announceManager) => {
	let result = [];
	let all_traffic_data = await announceManager.methods.get_all_announces().call({
		gas: 6000000,
	});
	for (let i = 0; i < all_traffic_data[1].length; i++) {
		let traffic_id = bytes32_to_string(all_traffic_data[0][i]);
		let traffic_addr = all_traffic_data[1][i]; //ownable addr
		let traffic_data = await announceManager.methods.get_announce(all_traffic_data[0][i]).call();
		let traffic_data_destination = await announceManager.methods.get_announce_destination(all_traffic_data[0][i]).call();
		let announce_data_total_money = await announceManager.methods.get_announce_total_money(all_traffic_data[0][i]).call();
		let owner = bytes32_to_string(all_traffic_data[0][i]); //random id
		//let announce =  traffic_data[0];
		let name =  bytes32_to_string(traffic_data[0]);
		let dates = parseInt(traffic_data[1]);
		let traffic = bytes32_to_string(traffic_data[2]);
		let people = parseInt(traffic_data[3]);
		let people_count = parseInt(traffic_data[4]);
		let money = parseInt(traffic_data[5]);
		let departure_lon = bytes32_to_string(traffic_data_destination[0]);
		let departure_lat = bytes32_to_string(traffic_data_destination[1]);
		let destination_lon = bytes32_to_string(traffic_data_destination[2]);
		let destination_lat = bytes32_to_string(traffic_data_destination[3]);
		let u = traffic_data_destination[4];
		let total_money = announce_data_total_money;
		result.push({
			traffic_id,
			traffic_addr,
			//announce,
			owner,
			name,
			dates,
			money,
			people,
			people_count,
			traffic,
			departure_lon,
			departure_lat,
			destination_lon,
			destination_lat,
			u,
			total_money
		});
	}
	return result;
}
