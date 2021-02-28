import React from "react";
import TravelTab from "../components/TravelTab";
import { ListGroup, Table, Modal, Button, Dropdown } from "react-bootstrap";
import Paper from "@material-ui/core/Paper";
import SearchBar from "../components/SearchBar";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance, contract_call, contract_send } from "../utils/getContract";
import { get_user_all_info, get_txn_all_info, get_lease_info } from "../utils/data";
import TransactionManager from "../contracts/TransactionManager.json";
import LeaseTransaction from "../contracts/LeaseTransaction.json";
import Lease from "../contracts/Lease.json";
import User from "../contracts/User.json";
import eth_addr from "../eth_contract.json";
import NoContent from "../components/NoContent";
import moment from "moment";
import "../index.scss";

export function TransactionList() {
	const [web3, set_web3] = React.useState(null);
	const [TM, set_TM] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [select_account, set_select_account] = React.useState(null);
	const [user, set_user] = React.useState(null);
	const [txn_list, set_txn_list] = React.useState([]);
	const [current_data, set_current_data] = React.useState({});
	const [open, set_open] = React.useState(false);

	//初始載入web3
	React.useEffect(() => {
		const load = async () => {
			let web3 = await connect_to_web3();
			if (web3) {
				set_web3(web3);
			}
		};
		load();
	}, []);

	//載入所有帳戶
	React.useEffect(() => {
		const load = async () => {
			if (web3) {
				let accounts = await web3.eth.getAccounts();
				set_accounts(accounts);
			}
		};
		load();
	}, [web3]);

	//載入User
	React.useEffect(() => {
		let user_str = localStorage.getItem("user");
		if (user_str) {
			let user = JSON.parse(user_str);
			set_user(user);
		}
	}, [web3]);

	//載入智能合約實體
	React.useEffect(() => {
		const load = async () => {
			if (web3 && user) {
				let TM = await getContractInstance(
					web3,
					TransactionManager,
					eth_addr.TransactionManager
				);
				set_TM(TM);
			}
		};
		load();
	}, [web3, user]);

	//載入使用者交易列表
	React.useEffect(() => {
		if (TM) {
			load_txn_list();
		}
	}, [TM]);

	const load_txn_list = async () => {
		let txn_list = [];
		let list = await contract_call(TM, "get_user_all_txns", [user.uid]);
		for (let i = 0; i < list[0].length; i++) {
			let txn_contract = await getContractInstance(web3, LeaseTransaction, list[1][i]);
			let txn_data = await get_txn_all_info(txn_contract);
			let lease_contract = await getContractInstance(web3, Lease, txn_data.lease);
			let lease_data = await get_lease_info(lease_contract);
			txn_list.push({
				...txn_data,
				lease_data,
				txn_id: list[0][i],
				txn_addr: list[1][i],
			});
		}
		set_txn_list(txn_list);
		console.log(txn_list);
		console.log(list);
	};

	//更改輸入值
	const onChange = (type, value) => {
		switch (type) {
			case "account":
				set_select_account(value);
				break;
		}
	};

	//載入交易用戶資料
	const open_modal = async (item) => {
		const sender_contract = await getContractInstance(web3, User, item.sender);
		const renter_contract = await getContractInstance(web3, User, item.renter);
		const borrower_contract = await getContractInstance(web3, User, item.borrower);
		const sender_data = await get_user_all_info(sender_contract);
		const renter_data = await get_user_all_info(renter_contract);
		const borrower_data = await get_user_all_info(borrower_contract);

		set_current_data({
			...item,
			sender_data,
			renter_data,
			borrower_data,
		});
		set_open(true);
	};

	const close_modal = () => {
		set_open(false);
	};

	const submit = async () => {
		if (!select_account) {
			alert("請先選擇帳戶");
			return;
		}

		let txn_contract = await getContractInstance(web3, LeaseTransaction, current_data.txn_addr);
		let result = await contract_send(txn_contract, "check_txn", [user.address], {
			from: select_account,
			gas: 6000000,
		});

		await load_txn_list();
		set_open(false);
		console.log(result);
	};

	const complete_txn = async () => {
		if (!select_account) {
			alert("請先選擇帳戶");
			return;
		}

		let txn_contract = await getContractInstance(web3, LeaseTransaction, current_data.txn_addr);
		let result = await contract_send(txn_contract, "complete_txn", [], {
			from: select_account,
			gas: 6000000,
		});

		await load_txn_list();
		set_open(false);
		console.log(result);
	};

	if (web3 && user) {
		return (
			<div className="d-flex flex-column align-items-center pt-5">
				<div className="w-50">
					<TravelTab currentPage={3} />
				</div>
				<h3 className="text-white-50 mb-3">所有交易總覽</h3>
				<div className="w-50">
					<SearchBar />
					<hr color="white" />
					<Paper elevation={3}>
						<ListGroup>
							{txn_list.map((item, i) => {
								return (
									<ListGroup.Item
										key={i}
										action
										variant="primary"
										style={{
											whiteSpace: "normal",
											overflow: "hidden",
											textOverflow: "ellipsis",
										}}
										onClick={(e) => open_modal(item)}
									>
										{`【${item.lease_data.house_name}】【${item.txn_addr}】`}
									</ListGroup.Item>
								);
							})}
						</ListGroup>
					</Paper>
				</div>
				<Modal show={open} onHide={close_modal} centered size="lg">
					<Modal.Header closeButton>
						<Modal.Title
							style={{
								whiteSpace: "normal",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>{`【${current_data.sender}】`}</Modal.Title>
					</Modal.Header>
					<TxnDetails txn_data={current_data} complete_txn={complete_txn} />
					<Dropdown>
						<Dropdown.Toggle variant="success" className="w-100">
							{select_account || "選擇帳戶"}
						</Dropdown.Toggle>
						<Dropdown.Menu className="w-100">
							{accounts.map((item, i) => {
								return (
									<Dropdown.Item
										className="text-center"
										key={i}
										onClick={() => onChange("account", item)}
									>
										{item}
									</Dropdown.Item>
								);
							})}
						</Dropdown.Menu>
					</Dropdown>
					<Button
						variant="warning"
						size="lg"
						className="font-weight-bold"
						block
						onClick={submit}
					>
						{"確認交易"}
					</Button>
				</Modal>
			</div>
		);
	} else {
		if (!web3) {
			return <NoContent message="尚未連結區塊鏈..." />;
		} else if (!user) {
			return <NoContent message="尚未進行登入..." />;
		}
	}
}

export function TxnDetails({ txn_data = {}, complete_txn }) {
	const [show_sender, set_show_sender] = React.useState(false);
	const [show_renter, set_show_renter] = React.useState(false);
	const [show_borrower, set_show_borrower] = React.useState(false);
	const [show_lease, set_show_lease] = React.useState(false);

	const onChange = (type) => {
		return (e) => {
			switch (type) {
				case "sender":
					set_show_sender(!show_sender);
					break;
				case "renter":
					set_show_renter(!show_renter);
					break;
				case "borrower":
					set_show_borrower(!show_borrower);
					break;
				case "lease":
					set_show_lease(!show_lease);
					break;
				default:
					break;
			}
		};
	};

	return (
		<Table striped bordered hover variant="dark" className="m-0">
			<thead>
				<tr>
					<th colSpan={4} className="text-center">
						<div className="d-flex align-items-center justify-content-center">
							{txn_data.complete ? "交易已完成" : "交易未完成"}
							<Button
								variant="outline-warning"
								size="sm"
								className="font-weight-bold ml-3"
								onClick={complete_txn}
							>
								{"完成交易"}
							</Button>
						</div>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td colSpan={1}>{"交易編號"}</td>
					<td colSpan={3}>{txn_data.txn_id}</td>
				</tr>
				<tr>
					<td colSpan={1}>{"交易創立者"}</td>
					<td colSpan={3}>
						{txn_data.sender_data && txn_data.sender_data.uid}
						<button className="show-detail-btn" onClick={onChange("sender")}>
							區塊鏈地址
						</button>
						{show_sender && txn_data.sender}
					</td>
				</tr>
				<tr>
					<td colSpan={1}>{"租方"}</td>
					<td colSpan={3}>
						{txn_data.renter_data && txn_data.renter_data.uid}
						<button className="show-detail-btn" onClick={onChange("renter")}>
							區塊鏈地址
						</button>
						{show_renter && txn_data.renter}
					</td>
				</tr>
				<tr>
					<td colSpan={1}>{"借方"}</td>
					<td colSpan={3}>
						{txn_data.borrower_data && txn_data.borrower_data.uid}
						<button className="show-detail-btn" onClick={onChange("borrower")}>
							區塊鏈地址
						</button>
						{show_borrower && txn_data.borrower}
					</td>
				</tr>
				<tr>
					<td colSpan={1}>{"房間名稱"}</td>
					<td colSpan={3}>
						{txn_data.lease_data && txn_data.lease_data.house_name}
						<button className="show-detail-btn" onClick={onChange("lease")}>
							區塊鏈地址
						</button>
						{show_lease && txn_data.lease}
					</td>
				</tr>
				<tr>
					<td colSpan={1}>{"房間類型"}</td>
					<td colSpan={3}>{`${txn_data.lease_data && txn_data.lease_data.category}`}</td>
				</tr>
				<tr>
					<td>{"租方交易確認"}</td>
					<td>{txn_data.renter_check ? "已確認" : "尚未確認"}</td>
					<td>{"借方方交易確認"}</td>
					<td>{txn_data.borrower_check ? "已確認" : "尚未確認"}</td>
				</tr>
				<tr>
					<td colSpan={1}>{"交易金額"}</td>
					<td colSpan={3} className="text-center">
						{txn_data.money}
					</td>
				</tr>
				<tr>
					<td>{"開始交易時間"}</td>
					<td>{moment(txn_data.start_time).toISOString()}</td>
					<td>{"結束交易時間"}</td>
					<td>
						{txn_data.end_time ? moment(txn_data.end_time).toISOString() : "尚未結束"}
					</td>
				</tr>
			</tbody>
		</Table>
	);
}
