import { getContractInstance } from "./getContract";
import lease from "../contracts/Lease.json";
import { bytes32_to_string } from "./tools";
import { contract_call } from "./getContract";

//取得使用者所有房間
export const get_user_all_lease_info = async (web3, user, leaseManager) => {
	let result = [];
	let all_leases_data = await leaseManager.methods.get_user_all_leases(user.uid).call();

	for (let i = 0; i < all_leases_data[1].length; i++) {
		let lease_id = bytes32_to_string(all_leases_data[0][i]);
		let lease_addr = all_leases_data[1][i];
		let lease_instance = await getContractInstance(web3, lease, lease_addr);
		let lease_data = await contract_call(lease_instance, "get_all_info", []);
		let owner = bytes32_to_string(user.uid);
		let owner_addr = user.address || lease_data[0];
		let house_name = lease_data[1];
		let category = lease_data[2];
		let rented_out = lease_data[3];
		let start_time = parseInt(lease_data[4]) * 1000;
		let end_time = parseInt(lease_data[5]) * 1000;
		let price = parseInt(lease_data[6]);
		let quantity = parseInt(lease_data[7]);
		let lon = lease_data[8];
		let lat = lease_data[9];
		result.push({
			lease_id,
			lease_addr,
			owner,
			owner_addr,
			house_name,
			category,
			rented_out,
			start_time,
			end_time,
			price,
			quantity,
			lon,
			lat,
		});
	}
	return result;
};

//取得指定房間資訊
export const get_lease_info = async (lease_contract) => {
	let lease_data = await contract_call(lease_contract, "get_all_info", []);
	let owner_addr = lease_data[0];
	let house_name = lease_data[1];
	let category = lease_data[2];
	let rented_out = lease_data[3];
	let start_time = parseInt(lease_data[4]) * 1000;
	let end_time = parseInt(lease_data[5]) * 1000;
	let price = parseInt(lease_data[6]);
	let quantity = parseInt(lease_data[7]);
	let lon = lease_data[8];
	let lat = lease_data[9];

	return {
		owner_addr,
		house_name,
		category,
		rented_out,
		start_time,
		end_time,
		price,
		quantity,
		lon,
		lat,
	};
};

//取得用戶資訊
export const get_user_all_info = async (user_contract) => {
	let uid = bytes32_to_string(await contract_call(user_contract, "get_uid"));
	let account = bytes32_to_string(await contract_call(user_contract, "get_password"));
	let password = await contract_call(user_contract, "get_account");
	return {
		uid,
		account,
		password,
	};
};

//取得交易資訊
export const get_txn_all_info = async (txn_contract) => {
	let txn_info = await contract_call(txn_contract, "get_txn_info");
	let txn_status = await contract_call(txn_contract, "get_txn_status");
	let txn_times = await contract_call(txn_contract, "get_txn_times");
	let txn_money = await contract_call(txn_contract, "get_txn_money");

	let sender = txn_info[0];
	let renter = txn_info[1];
	let borrower = txn_info[2];
	let lease = txn_info[3];
	let renter_check = txn_status[0];
	let borrower_check = txn_status[1];
	let complete = txn_status[2];
	let start_time = parseInt(txn_times[0]) * 1000;
	let end_time = parseInt(txn_times[1]) * 1000;
	let money = txn_money;

	return {
		sender,
		renter,
		borrower,
		lease,
		renter_check,
		borrower_check,
		complete,
		start_time,
		end_time,
		money,
	};
};

//取得帳戶資訊
export const get_user_account_info = async (account_contract) => {
	let owner_addr = await contract_call(account_contract, "get_owner");
	let balance = await contract_call(account_contract, "get_balance");
	let create_date = parseInt(await contract_call(account_contract, "create_date")) * 1000;
	let update_date = parseInt(await contract_call(account_contract, "update_date")) * 1000;

	return {
		owner_addr,
		balance,
		create_date,
		update_date,
	};
};
