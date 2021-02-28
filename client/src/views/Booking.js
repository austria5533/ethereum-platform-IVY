import React from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance, contract_send } from "../utils/getContract";
import { get_lease_info, get_user_all_info } from "../utils/data";
import User from "../contracts/User.json";
import Lease from "../contracts/Lease.json";
import NoContent from "../components/NoContent";
import moment from "moment";
import { Button, Dropdown } from "react-bootstrap";

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

export function Booking() {
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [select_account, set_select_account] = React.useState(null);
	const [user, set_user] = React.useState(null);
	const [owner, set_owner] = React.useState(null);
	const [user_contract, set_user_contract] = React.useState(null);
	const [lease_contract, set_lease_contract] = React.useState(null);
	const [lease_data, set_lease_data] = React.useState(null);
	const history = useHistory();
	const query = useQuery();
	const { id } = useParams();

	//載入web3
	React.useEffect(() => {
		const load = async () => {
			let web3 = await connect_to_web3();
			set_web3(web3);
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

	//載入合約實體
	React.useEffect(() => {
		const load = async () => {
			if (web3 && id && user) {
				let user_contract = await getContractInstance(web3, User, user.address);
				let lease_contract = await getContractInstance(web3, Lease, id);
				set_user_contract(user_contract);
				set_lease_contract(lease_contract);
			}
		};
		load();
	}, [web3, id, user]);

	//載入房間資訊
	React.useEffect(() => {
		const load = async () => {
			if (lease_contract) {
				let lease_data = await get_lease_info(lease_contract);
				set_lease_data(lease_data);
				console.log(lease_data);
			}
		};
		load();
	}, [lease_contract]);

	//載入房間擁有者
	React.useEffect(() => {
		const load = async () => {
			if (lease_data) {
				const owner_contract = await getContractInstance(web3, User, lease_data.owner_addr);
				const owner = await get_user_all_info(owner_contract);
				set_owner(owner);
			}
		};
		load();
	}, [lease_data]);

	//更改輸入值
	const onChange = (type, value) => {
		switch (type) {
			case "account":
				set_select_account(value);
				break;
			default:
				break;
		}
	};

	//送出訂單
	const submit = async () => {
		if (!select_account) {
			alert("請先選擇帳戶");
			return;
		}

		if (user.address === lease_data.owner_addr) {
			alert("您為房間擁有者，不能下單");
			return;
		}

		try {
			const result = await contract_send(
				user_contract,
				"create_lease_txn",
				[1, lease_data.owner_addr, id, lease_data.price],
				{
					from: select_account,
					gas: 6000000,
				}
			);
			console.log(result);
			alert("交易成功");
			history.push("/txnList");
		} catch (error) {
			console.log(error);
			alert("交易失敗");
		}
	};

	if (lease_data) {
		return (
			<div className="d-flex flex-column justify-content-center">
				<div style={{ height: "400px" }}>
					<img src="https://source.unsplash.com/random" width={"100%"} height={400} />
				</div>
				<div className="d-flex pl-5 mt-3 align-items-end">
					<h1 className="ml-5 font-weight-bold text-white">{lease_data.house_name}</h1>
					<h4 className="ml-1 font-weight-bold text-success">
						{lease_data.rented_out ? "【已出租】" : "【尚未出租】"}
					</h4>
					<h3 className="ml-3 font-weight-bold text-warning">{`目前價格: ${lease_data.price} NT`}</h3>
				</div>
				<div className="d-flex pl-5 pr-5 mt-3 align-items-start justify-content-between">
					<h5 className="ml-5 font-weight-bold text-white-50">{`地點: ${lease_data.lon}, ${lease_data.lat}`}</h5>
					<div className="w-25">
						<Dropdown className="mb-3">
							<Dropdown.Toggle
								variant="success"
								className="w-100 font-weight-bold overflow-hidden"
							>
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
							block
							variant="warning"
							className="font-weight-bold p-3"
							onClick={submit}
						>
							下訂房間
						</Button>
					</div>
				</div>
				<div className="pl-5 pr-5">
					<hr className="w-100 border border-secondary" />
				</div>
				<div className="d-flex pl-5 mt-3 align-items-end">
					<h4 className="ml-5 font-weight-bold text-white-50">{`房間種類: ${lease_data.category}`}</h4>
				</div>
				<div className="d-flex pl-5 mt-3 align-items-end">
					<h4 className="ml-5 font-weight-bold text-white-50">{`剩餘房間數量: ${lease_data.quantity}`}</h4>
				</div>
				<div className="d-flex pl-5 mt-3 align-items-end">
					<h4 className="ml-5 font-weight-bold text-white-50">{`可訂房開始時間: ${moment(
						lease_data.start_time
					).toLocaleString()}`}</h4>
				</div>
				<div className="d-flex pl-5 mt-3 align-items-end">
					<h4 className="ml-5 font-weight-bold text-white-50">{`可訂房結束時間: ${moment(
						lease_data.end_time
					).toLocaleString()}`}</h4>
				</div>
				<div className="d-flex pl-5 mt-3 align-items-end">
					<h4 className="ml-5 font-weight-bold text-secondary">{`聯絡人: ${
						owner && owner.uid
					}`}</h4>
				</div>
			</div>
		);
	} else {
		return <NoContent message="正在載入資料..." />;
	}
}
