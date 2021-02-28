import React from "react";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { InputGroup, FormControl, Button, Dropdown, DropdownButton } from "react-bootstrap";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance, contract_send, contract_call } from "../utils/getContract";
import Auth from "../contracts/Auth.json";
import UserManager from "../contracts/UserManager.json";
import { string_to_bytes32 } from "../utils/tools";
import eth_addr from "../eth_contract.json";
import NoContent from "../components/NoContent";
import { useHistory } from "react-router-dom";

export function Login({}) {
	const [uid, set_uid] = React.useState("");
	const [password, set_password] = React.useState("");
	const [select_account, set_select_account] = React.useState(null);
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [auth_contract, set_auth_contract] = React.useState(null);
	const [userManager_contract, set_userManager_contract] = React.useState(null);
	const [payload, set_payload] = React.useState(null);
	const history = useHistory();

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

	//更新帳戶資料
	React.useEffect(() => {
		const load = async () => {
			if (web3) {
				let accounts = await web3.eth.getAccounts();
				set_accounts(accounts);
			}
		};
		load();
	}, [web3]);

	//更新智能合約
	React.useEffect(() => {
		const load = async () => {
			if (web3) {
				let contract1 = await getContractInstance(web3, Auth, eth_addr.Auth);
				let contract2 = await getContractInstance(web3, UserManager, eth_addr.UserManager);
				set_auth_contract(contract1);
				set_userManager_contract(contract2);
			}
		};
		load();
	}, [web3]);

	//更改輸入值
	const onChange = (type, value) => {
		switch (type) {
			case "account":
				set_select_account(value);
				break;
			case "uid":
				set_uid(value);
				break;
			case "password":
				set_password(value);
				break;
			default:
				break;
		}
	};

	//檢查是否有這個帳戶
	const check_user = async () => {
		try {
			let bytes_uid = string_to_bytes32(uid);
			// * 執行智能合約
			let result = await contract_call(userManager_contract, "get_user", [bytes_uid], {
				from: select_account,
				gas: 6000000,
			});
			console.log(result);
			return result;
		} catch (error) {
			console.log(error);
			return false;
		}
	};

	//註冊
	const register = async () => {
		if (!web3) {
			alert("web3未載入!");
			return;
		}
		if (accounts.length === 0) {
			alert("區塊鏈上沒有任何帳戶!");
			return;
		}
		if (!select_account) {
			alert("請選擇帳戶!");
			return;
		}
		if (!password) {
			alert("請輸入密碼!");
			return;
		}
		if (!uid) {
			alert("請輸入帳戶!");
			return;
		}
		try {
			// * 轉型(因智能合約參數使用bytes32)
			let bytes_uid = string_to_bytes32(uid);
			let bytes_password = string_to_bytes32(password);

			// * 呼叫智能合約新增帳戶
			let result = await contract_send(
				auth_contract,
				"create_user",
				[bytes_uid, bytes_password],
				{
					from: select_account,
					gas: 6000000,
				}
			);

			if (result) {
				set_payload(JSON.stringify(result));
				alert("註冊成功");
			} else {
				alert("註冊失敗");
			}

			console.log(result);
		} catch (error) {
			alert("註冊失敗");
			console.log(error);
		}
	};

	//登入
	const onSubmit = async () => {
		if (!web3) {
			alert("web3未載入!");
			return;
		}
		if (accounts.length === 0) {
			alert("區塊鏈上沒有任何帳戶!");
			return;
		}
		if (!select_account) {
			alert("請選擇帳戶!");
			return;
		}
		if (!password) {
			alert("請輸入密碼!");
			return;
		}

		//查看用戶使否存在
		const user = await check_user();

		if (user) {
			try {
				let bytes_uid = string_to_bytes32(uid);
				let bytes_password = string_to_bytes32(password);
				// * 執行智能合約
				let result = await contract_call(
					auth_contract,
					"verify",
					[bytes_uid, bytes_password],
					{
						from: select_account,
						gas: 6000000,
					}
				);

				if (result) {
					let user_obj = {
						address: user[0],
						uid: user[1],
						password: user[1],
					};
					localStorage.setItem("user", JSON.stringify(user_obj));
					alert("登入成功");
					history.push("/houseSearch");
				} else {
					alert("登入失敗");
				}
			} catch (error) {
				alert("發生錯誤");
				console.log(error);
			}
		} else {
			alert("用戶不存在");
		}
	};

	if (web3) {
		return (
			<div className="d-flex flex-column p-3 justify-content-center align-items-center">
				<Paper elevation={5} className="w-75 h-75 p-3 d-flex flex-column">
					<h1 className="text-center mb-3">{"登入"}</h1>
					<Dropdown className="mb-3">
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
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"用戶帳號"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入帳號"
							onChange={(e) => onChange("uid", e.target.value)}
						/>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"密碼"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入密碼"
							onChange={(e) => onChange("password", e.target.value)}
						/>
					</InputGroup>
					<p className="text-center overflow-auto">{payload || "無資料"}</p>
					<Button
						variant="warning"
						size="lg"
						block
						className="mt-auto"
						onClick={register}
						disabled={!auth_contract}
					>
						{"註冊"}
					</Button>
					<Button
						variant="primary"
						size="lg"
						block
						onClick={onSubmit}
						disabled={!auth_contract}
					>
						{"登入"}
					</Button>
				</Paper>
			</div>
		);
	} else {
		return <NoContent message="尚未連結至區塊鏈..." />;
	}
}

Login.propTypes = {};
