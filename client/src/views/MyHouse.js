import React from "react";
import TravelTab from "../components/TravelTab";
import { Button, Form, Dropdown, ListGroup, Modal } from "react-bootstrap";
import Paper from "@material-ui/core/Paper";
import NoContent from "../components/NoContent";
import { getContractInstance, contract_call, contract_send } from "../utils/getContract";
import { connect_to_web3 } from "../utils/getWeb3";
import { string_to_bytes32, generate_id, convert_dateTime_str } from "../utils/tools";
import { get_user_all_lease_info } from "../utils/data";
import { get_data_from_address, get_data_from_coordinate } from "../utils/api";
import eth_addr from "../eth_contract.json";
import User from "../contracts/User.json";
import LeaseManager from "../contracts/LeaseManager.json";
import Lease from "../contracts/Lease.json";
import HouseMap from "../components/HouseMap";
import moment from "moment";
import SearchBar from "../components/SearchBar";

export function MyHouse(props) {
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [LM, set_LM] = React.useState(null);
	const [user_contract, set_user_contract] = React.useState(null);
	const [house_list, set_house_list] = React.useState([]);
	const [user, set_user] = React.useState(null);
	const [search_text, set_search_text] = React.useState("");
	const [search_data, set_search_data] = React.useState();

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

	//載入智能合約實體
	React.useEffect(() => {
		const load = async () => {
			if (web3 && user) {
				let instance1 = await getContractInstance(web3, User, user.address);
				let instance2 = await getContractInstance(
					web3,
					LeaseManager,
					eth_addr.LeaseManager
				);
				set_user_contract(instance1);
				set_LM(instance2);
			}
		};
		load();
	}, [web3, user]);

	//載入房間
	React.useEffect(() => {
		load_user_leases();
	}, [LM, web3]);

	//取得使用者所有房子
	const load_user_leases = async () => {
		if (web3 && LM) {
			let list = await get_user_all_lease_info(web3, user, LM);
			set_house_list(list);
			console.log(list);
		}
	};

	//更新搜尋文字
	const onChange = (e) => {
		set_search_text(e.target.value);
	};

	//搜尋地點
	const handle_search = async () => {
		if (search_text != "") {
			const data = await get_data_from_address(search_text);
			if (data) {
				set_search_data(data);
			}
			console.log(data);
		}
	};

	if (web3 && user) {
		return (
			<div className="d-flex flex-column align-items-center pt-5">
				<div className="w-50">
					<TravelTab currentPage={2} />
					<SearchBar onChange={onChange} onSubmit={handle_search} />
					<hr color="white" />
				</div>
				<div className="row w-100 pt-3 pl-5 pr-5 pb-5 d-flex">
					<div className="col-7" style={{ height: "600px" }}>
						<HouseMap
							accounts={accounts}
							user_contract={user_contract}
							house_list={house_list}
							refresh={load_user_leases}
							canAdd={true}
							search_data={search_data}
						/>
					</div>
					<div className="col-5">
						<HouseList
							accounts={accounts}
							web3={web3}
							house_list={house_list}
							refresh={load_user_leases}
						/>
					</div>
				</div>
			</div>
		);
	} else {
		if (!user) {
			return <NoContent message="尚未進行登入..." />;
		}
		return <NoContent message="尚未連結至區塊鏈..." />;
	}
}

const HouseList = ({ web3, accounts, house_list, refresh }) => {
	const [current_data, set_current_data] = React.useState({});
	const [open, set_open] = React.useState(null);
	const [lease_contract, set_lease_contract] = React.useState(null);

	//開啟視窗
	const open_modal = async (item) => {
		//取得房屋合約實體
		let instance = await getContractInstance(web3, Lease, item.lease_addr);
		set_lease_contract(instance);
		set_current_data(item);
		set_open(true);
	};

	//關閉視窗
	const close_modal = () => {
		set_open(false);
		refresh();
	};

	return (
		<React.Fragment>
			<h3 className="text-white-50 text-center">提供房間列表</h3>;
			<Paper elevation={3} className="w-100">
				<ListGroup>
					{house_list.map((item, i) => {
						return (
							<ListGroup.Item
								key={i}
								action
								variant="success"
								style={{
									textAlign: "center",
									whiteSpace: "normal",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
								onClick={(e) => open_modal(item)}
							>
								{`【${item.house_name}】 #${item.lease_id} `}
							</ListGroup.Item>
						);
					})}
				</ListGroup>
			</Paper>
			<Modal show={open} onHide={close_modal} centered>
				<Modal.Header closeButton>
					<Modal.Title
						style={{
							overflowWrap: "anywhere",
						}}
					>{`【${current_data.lease_addr}】`}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<UpdateHouse
						accounts={accounts}
						lease_data={current_data}
						lease_contract={lease_contract}
						close_modal={close_modal}
					/>
				</Modal.Body>
				<Modal.Footer></Modal.Footer>
			</Modal>
		</React.Fragment>
	);
};

const UpdateHouse = ({ accounts, lease_data, lease_contract, close_modal }) => {
	const [form_data, set_form_data] = React.useState({});
	const [select_account, set_select_account] = React.useState(null);
	const [address, set_address] = React.useState("");

	//載入表單資料
	React.useEffect(() => {
		set_form_data({
			...lease_data,
			start_time: convert_dateTime_str(lease_data.start_time),
			end_time: convert_dateTime_str(lease_data.end_time),
		});
	}, [lease_data]);

	//載入地址
	React.useEffect(() => {
		const load = async () => {
			if (lease_data.lat && lease_data.lon) {
				const data = await get_data_from_coordinate({
					lat: lease_data.lat,
					lon: lease_data.lon,
				});
				set_address(data.address);

				console.log(data);
			}
		};
		load();
	}, [lease_data]);

	const onChange = (key, value) => {
		switch (key) {
			case "account":
				set_select_account(value);
				break;
			case "lon":
				set_form_data({
					...form_data,
					lon: value,
				});
				break;
			case "lat":
				set_form_data({
					...form_data,
					lat: value,
				});
				break;
			case "rented_out":
				set_form_data({
					...form_data,
					rented_out: !form_data.rented_out,
				});
				break;
			case "house_name":
				set_form_data({
					...form_data,
					house_name: value,
				});
				break;
			case "category":
				set_form_data({
					...form_data,
					category: value,
				});
				break;
			case "start_time":
				set_form_data({
					...form_data,
					start_time: value,
				});
				break;
			case "end_time":
				set_form_data({
					...form_data,
					end_time: value,
				});
				break;
			case "price":
				set_form_data({
					...form_data,
					price: parseInt(value),
				});
				break;
			case "quantity":
				set_form_data({
					...form_data,
					quantity: parseInt(value),
				});
				break;
			default:
				break;
		}
	};

	const onSubmit = async () => {
		if (!select_account) {
			alert("請先選擇帳戶");
			return;
		}

		//更新房屋資訊
		let result1 = await contract_send(
			lease_contract,
			"update_room_info",
			[
				form_data.house_name,
				form_data.category,
				moment(form_data.start_time).unix(),
				moment(form_data.end_time).unix(),
				form_data.quantity,
			],
			{
				from: select_account,
				gas: 6000000,
			}
		);

		//更新房地理位址
		let result2 = await contract_send(
			lease_contract,
			"update_location",
			[form_data.lon, form_data.lat],
			{
				from: select_account,
				gas: 6000000,
			}
		);

		//更新租房價格
		let result3 = await contract_send(lease_contract, "update_room_price", [form_data.price], {
			from: select_account,
			gas: 6000000,
		});

		//更新房屋狀態
		let result4 = await contract_send(
			lease_contract,
			form_data.rented_out ? "rent" : "release",
			[],
			{
				from: select_account,
				gas: 6000000,
			}
		);

		console.log(result1, result2, result3, result4);

		close_modal();
	};

	console.log(form_data);

	return (
		<React.Fragment>
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
								onClick={(e) => onChange("account", item)}
							>
								{item}
							</Dropdown.Item>
						);
					})}
				</Dropdown.Menu>
			</Dropdown>
			<hr />
			<Form>
				<Form.Check
					type="switch"
					id="isRented"
					label={!form_data.rented_out ? "開放租房" : "停止租房"}
					checked={form_data.rented_out !== null ? !form_data.rented_out : false}
					onChange={(e) => onChange("rented_out")}
				/>

				<hr />
				<Form.Group>
					<Form.Label>房間地址</Form.Label>
					<Form.Control
						type="text"
						value={address}
						placeholder="請輸入房間地址"
						onChange={(e) => {}}
						disabled
					/>
				</Form.Group>
				<Form.Group>
					<Form.Label>房間名稱</Form.Label>
					<Form.Control
						type="text"
						value={form_data.house_name || ""}
						placeholder="請輸入房間名稱"
						onChange={(e) => onChange("house_name", e.target.value)}
					/>
				</Form.Group>
				<Form.Group>
					<Form.Label>房間種類</Form.Label>
					<Form.Control
						type="text"
						value={form_data.category || ""}
						placeholder="請輸入房間種類"
						onChange={(e) => onChange("category", e.target.value)}
					/>
				</Form.Group>
				<Form.Group>
					<Form.Label>房間價格</Form.Label>
					<Form.Control
						type="text"
						value={form_data.price > 0 ? form_data.price : ""}
						placeholder="請輸入房間價格"
						onChange={(e) => onChange("price", e.target.value)}
					/>
				</Form.Group>
				<Form.Group>
					<Form.Label>房間數量</Form.Label>
					<Form.Control
						type="text"
						value={form_data.quantity > 0 ? form_data.quantity : ""}
						placeholder="請輸入房間數量"
						onChange={(e) => onChange("quantity", e.target.value)}
					/>
				</Form.Group>
				<hr />
				<Form.Group>
					<Form.Label>可出租起始時間</Form.Label>
					<Form.Control
						type="datetime-local"
						value={form_data.start_time || ""}
						onChange={(e) => onChange("start_time", e.target.value)}
					/>
				</Form.Group>
				<Form.Group>
					<Form.Label>可出租結束時間</Form.Label>
					<Form.Control
						type="datetime-local"
						value={form_data.end_time || ""}
						onChange={(e) => onChange("end_time", e.target.value)}
					/>
				</Form.Group>
				<hr />
				<Form.Group>
					<Form.Label>地圖經度</Form.Label>
					<Form.Control
						type="text"
						value={form_data.lon || ""}
						placeholder="請輸入經度"
						onChange={(e) => onChange("lon", e.target.value)}
					/>
				</Form.Group>
				<Form.Group>
					<Form.Label>地圖緯度</Form.Label>
					<Form.Control
						type="text"
						value={form_data.lat || ""}
						placeholder="請輸入緯度"
						onChange={(e) => onChange("lat", e.target.value)}
					/>
				</Form.Group>
				<Button variant="primary" onClick={onSubmit} block>
					確定儲存
				</Button>
			</Form>
		</React.Fragment>
	);
};
