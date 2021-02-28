import React from "react";
import Paper from "@material-ui/core/Paper";
import { ListGroup } from "react-bootstrap";
import { connect_to_web3, get_blockchain_info } from "../utils/getWeb3";

export function Home() {
	const [web3, set_web3] = React.useState(null);
	const [blockchain_info, set_blockchain_info] = React.useState({});

	// 載入web3
	React.useEffect(() => {
		const load = async () => {
			let web3 = await connect_to_web3();

			if (web3) {
				set_web3(web3);
			}
		};
		load();
	}, []);

	// 取得區塊鏈資料
	React.useEffect(() => {
		if (web3) {
			refresh();
		}
	}, [web3]);

	// 重整頁面並取得資料
	const refresh = async () => {
		let data = await get_blockchain_info(web3);
		if (data) {
			set_blockchain_info(data);
		}
		console.log(data);
	};

	console.log(web3);

	if (web3) {
		return (
			<div className="d-flex flex-column h-75 justify-content-center align-items-center">
				<Paper elevation={5} className="w-75 h-75">
					<ListGroup variant="flush">
						<ListGroup.Item action variant="primary">
							{"區塊鏈上所有帳戶"}
						</ListGroup.Item>
						{blockchain_info.accounts &&
							blockchain_info.accounts.map((item, i) => {
								return <ListGroup.Item key={i}>{item}</ListGroup.Item>;
							})}
						<ListGroup.Item action variant="success">
							{"區塊鏈狀態"}
						</ListGroup.Item>
						<ListGroup.Item>{`目前區塊數量： ${blockchain_info.block_number}`}</ListGroup.Item>
						<ListGroup.Item>{`目前鏈上節點數量： ${
							blockchain_info.peer_count + 1
						}`}</ListGroup.Item>
						<ListGroup.Item>{`挖礦狀態： ${
							blockchain_info.is_mining ? "正在挖礦" : "停止挖礦"
						}`}</ListGroup.Item>
						<ListGroup.Item>{`尋找網路節點狀態： ${
							blockchain_info.is_listening ? "監聽網路節點中" : "未監聽網路節點"
						}`}</ListGroup.Item>
						<ListGroup.Item action variant="warning">
							{"區塊鏈設定"}
						</ListGroup.Item>
						<ListGroup.Item>{`挖礦獎勵帳戶： ${
							blockchain_info.coinbase || "未設定"
						}`}</ListGroup.Item>
						<ListGroup.Item>{`預設帳戶： ${
							blockchain_info.default_account || "未設定"
						}`}</ListGroup.Item>
						<ListGroup.Item>{`預設網路： ${
							blockchain_info.default_chain || "測試網路"
						}`}</ListGroup.Item>
						<ListGroup.Item action variant="info">
							{"區塊鏈資訊"}
						</ListGroup.Item>
						<ListGroup.Item>{`網路ID： ${blockchain_info.network_id}`}</ListGroup.Item>
						<ListGroup.Item>{`節點資訊： ${blockchain_info.node_info}`}</ListGroup.Item>
						<ListGroup.Item>{`燃料花費： ${blockchain_info.gas_price}`}</ListGroup.Item>
					</ListGroup>
				</Paper>
			</div>
		);
	} else {
		return (
			<div className="d-flex flex-column h-75 justify-content-center align-items-center">
				{"loading..."}
			</div>
		);
	}
}
