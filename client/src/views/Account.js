import React from "react";
import { Card, ListGroup, Button, FormControl, InputGroup, Dropdown } from "react-bootstrap";
import TravelTab from "../components/TravelTab";
import User from "../contracts/User.json";
import UserAccount from "../contracts/UserAccount.json";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance, contract_call, contract_send } from "../utils/getContract";
import { get_user_account_info } from "../utils/data";
import NoContent from "../components/NoContent";
import moment from "moment";

export function Account() {
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [user_contract, set_user_contract] = React.useState(null);
	const [userAccount_contract, set_userAccount_contract] = React.useState(null);
	const [user, set_user] = React.useState(null);
	const [account, set_account] = React.useState({});
	const [select_account, set_select_account] = React.useState(null);
	const [money, set_money] = React.useState(0);

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
			if (web3 && user) {
				let user_contract = await getContractInstance(web3, User, user.address);
				let account_addr = await contract_call(user_contract, "get_account");
				console.log(account_addr);
				let userAccount_contract = await getContractInstance(
					web3,
					UserAccount,
					account_addr
				);
				set_user_contract(user_contract);
				set_userAccount_contract(userAccount_contract);
			}
		};
		load();
	}, [web3, user]);

	//載入帳戶資料
	React.useEffect(() => {
		const load = async () => {
			if (userAccount_contract) {
				let account = await get_user_account_info(userAccount_contract);
				set_account(account);
				console.log(account);
			}
		};
		load();
	}, [userAccount_contract]);

	//更改輸入值
	const onChange = (type, value) => {
		switch (type) {
			case "account":
				set_select_account(value);
				break;
			case "money":
				set_money(parseInt(value));
				break;
			default:
				break;
		}
	};

	//匯錢
	const send_money = async () => {
		if (!select_account) {
			alert("請先選擇帳戶");
			return;
		}

		let result = await contract_send(userAccount_contract, "set_balance", [money], {
			from: select_account,
			gas: 6000000,
		});

		document.location.reload();
	};

	if ((web3, user)) {
		return (
			<div className="d-flex flex-column align-items-center pt-5">
				<div className="w-50">
					<TravelTab currentPage={4} />
				</div>
				<div className="w-50">
					<Card>
						<Card.Header>帳戶詳細資訊</Card.Header>
						<ListGroup variant="flush">
							<ListGroup.Item>{`帳戶地址： ${
								userAccount_contract && userAccount_contract._address
							}`}</ListGroup.Item>
							<ListGroup.Item>{`用戶地址： ${account.owner_addr}`}</ListGroup.Item>
							<ListGroup.Item>{`帳戶餘額： ${
								account.balance || 0
							} 元`}</ListGroup.Item>
							<ListGroup.Item>{`更新時間： ${
								account.update_date
									? moment(account.update_date).toISOString()
									: "---"
							}`}</ListGroup.Item>
							<ListGroup.Item>{`創立時間： ${
								account.create_date
									? moment(account.create_date).toISOString()
									: "---"
							}`}</ListGroup.Item>
						</ListGroup>
						<Dropdown className="mt-5">
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
						<InputGroup>
							<FormControl
								placeholder="請輸入要設定的金額"
								onChange={(e) => onChange("money", e.target.value)}
							/>
							<InputGroup.Append className="w-25">
								<Button
									variant="warning"
									className="font-weight-bold"
									block
									onClick={send_money}
								>
									設定帳戶金額
								</Button>
							</InputGroup.Append>
						</InputGroup>
					</Card>
				</div>
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
