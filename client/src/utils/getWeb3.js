import Web3 from "web3";
import { WEB3_PROVIDER_URL } from "../config";

// 連結 web3
export const connect_to_web3 = async () => {
	try {
		// let web3 = window.web3;

		// Checking if Web3 has been injected by the browser (Mist/MetaMask).
		// const alreadyInjected = typeof web3 !== "undefined";

		const provider = new Web3.providers.HttpProvider(WEB3_PROVIDER_URL);
		let web3 = new Web3(provider);
		await web3.eth.net.getId();
		console.log("No web3 instance injected, using Local web3.");
		return web3;

		// if (alreadyInjected) {
		// 	// Use Mist/MetaMask's provider.
		// 	web3 = new Web3(web3.currentProvider);
		// 	console.log("Injected web3 detected.");
		// 	return web3;
		// } else {
		// 	// Fallback to localhost if no web3 injection. We've configured this to
		// 	// use the development console's port by default.
		// 	const provider = new Web3.providers.HttpProvider(WEB3_PROVIDER_URL);
		// 	web3 = new Web3(provider);
		// 	console.log("No web3 instance injected, using Local web3.");
		// 	return web3;
		// }
	} catch (error) {
		console.log(error);
		return null;
	}
};

// 取得區塊鏈上常用資訊
export const get_blockchain_info = async (web3) => {
	try {
		let accounts = await web3.eth.getAccounts(); //所有帳戶
		let is_mining = await web3.eth.isMining(); //是否正在挖礦
		let coinbase = await web3.eth.getCoinbase(); //挖礦獎勵帳戶
		let node_info = await web3.eth.getNodeInfo(); //節點資訊
		let gas_price = await web3.eth.getGasPrice(); //燃料
		let block_number = await web3.eth.getBlockNumber(); //目前區塊編號
		let network_id = await web3.eth.net.getId(); //網路id
		let is_listening = await web3.eth.net.isListening(); //是否正在監聽
		let peer_count = await web3.eth.net.getPeerCount(); //節點數量
		let default_account = web3.eth.defaultAccount; //預設操作帳戶
		let default_chain = web3.eth.defaultChain; //網路類型

		return {
			accounts,
			is_mining,
			coinbase,
			node_info,
			gas_price,
			block_number,
			network_id,
			is_listening,
			peer_count,
			default_account,
			default_chain,
		};
	} catch (error) {
		console.log(error);
		return null;
	}
};
