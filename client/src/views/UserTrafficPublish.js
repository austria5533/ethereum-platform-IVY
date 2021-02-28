import React from "react";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { InputGroup, Form, Button, Dropdown, DropdownButton,ListGroup ,Modal} from "react-bootstrap";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance, contract_send  } from "../utils/getContract";
import Announce from "../contracts/Announce.json";
import eth_addr from '../eth_contract.json';
import AnnounceManager from "../contracts/AnnounceManager.json";
import TrafficManager from "../contracts/TrafficManager.json";
import NoContent from "../components/NoContent";
import TrafficTab from "../components/TrafficTab";
import { get_all_announce_info, get_all_user_info } from "../utils/trafficall";
import { bytes32_to_string, string_to_bytes32, generate_id, convert_dateTime_str } from "../utils/tools";
import moment from "moment";
import User from "../contracts/User.json";
import { Map, Marker, Popup, TileLayer, Polygon, Rectangle } from "react-leaflet";

export function UserTrafficPublish(props) {
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [An, set_An] = React.useState(null);
	const [user, set_user] = React.useState(null);
	const [user_info, set_user_info] = React.useState(null);

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
				let instance1 = await getContractInstance(web3, AnnounceManager, eth_addr.AnnounceManager);
				let instance2 = await getContractInstance(web3, User, user.address);
				set_An(instance1);
				console.log(instance1);
				set_user_info(instance2);
			}
		};
		load();
	}, [web3, user]);
	

	if (web3 && user) {
		return (
			<div className="d-flex flex-column align-items-center pt-5">
				<div className="w-50">
					<TrafficTab currentPage={3} />
				</div>
				<div className="mb-3">
					<TrafficList accounts={accounts} web3={web3} An={An}  user={user}  user_info={user_info}/>
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

const TrafficList = ({ accounts, web3, An,user}) => {
	const [current_data, set_current_data] = React.useState({});
	const [open, set_open] = React.useState(null);
	const [traffic_list, set_traffic_list] = React.useState([]);
	const [traffic_contract, set_traffic_contract] = React.useState(null);
	const [traffic_contract1, set_traffic_contract1] = React.useState(null);
	const mapRef = React.useRef()
	//初始載入
	React.useEffect(() => {
		load_user_traffic();
	}, [An,web3]);

	//取得使用者所有揪團列表
	const load_user_traffic = async () => {
		if (web3&& An) {

			let all_announce_list = await get_all_announce_info(An); 
			let user_announce_list = await get_all_user_info(web3, all_announce_list, user);

			set_traffic_list(user_announce_list);
			console.log(user_announce_list);
		}
	};

	//開啟視窗
	const open_modal = async (item) => {
		//取得房屋合約實體
		let instance2 = await getContractInstance(web3, Announce, item.traffic_addr);
		set_traffic_contract1(instance2);
		set_current_data(item);
		set_open(true);
	};

	//關閉視窗
	const close_modal = () => {
		set_open(false);
		load_user_traffic();
	};

	const show_modal = () => {
		mapRef.current.leafletElement.invalidateSize()
		console.log(mapRef.current)
	}

	return (
		<div className="d-flex flex-column align-items-center w-100">
			<h3 className="text-white-50">提供揪團列表</h3>;
			<Paper elevation={5} className="w-100">
				<ListGroup>
					{traffic_list.map((item, i) => {
						return (
							<ListGroup.Item
								key={i}
								action
								variant="success"
								style={{
									whiteSpace: "normal",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
								onClick={(e) => open_modal(item)}
							>
								{`編號 : ${item.traffic_id}   發布者姓名 :【${item.name}】`}
							</ListGroup.Item>
						);
					})}
				</ListGroup>
			</Paper>
			<Modal show={open} onHide={close_modal} centered onShow={show_modal}>
				<Modal.Header closeButton>
					<Modal.Title
						style={{
							whiteSpace: "normal",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>{`${current_data.traffic_addr} 【${current_data.traffic_id}】`}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<UpdateHouse
						accounts={accounts}
						traffic_data={current_data}
						traffic_contract1={traffic_contract1}
						close_modal={close_modal}
						mapRef={mapRef}
					/>
				</Modal.Body>
				<Modal.Footer></Modal.Footer>
			</Modal>
		</div>
	);
};

const UpdateHouse = ({ accounts, traffic_data, traffic_contract1, mapRef, close_modal }) => {
	const [form_data, set_form_data] = React.useState({});
	const [select_account, set_select_account] = React.useState(null);

	//載入表單資料
	React.useEffect(() => {
		set_form_data({
			...traffic_data,
			 dates: convert_dateTime_str(traffic_data.dates),
		});
		console.log(traffic_data.dates);
	}, [traffic_data]);
	console.log(form_data);

	const onChange = (key, value) => {
		switch (key) {
			case "account":
				set_select_account(value);
				break;
			default:
				set_form_data({
					...form_data,
					[key]: value,
				});
		}
	};

	const onSubmit = async () => {
		if (!select_account) {
			alert("請先選擇帳戶");
			return;
		}

		//更新資訊
		let result1 = await contract_send(
			traffic_contract1,
			"update_announce_info",
			[
				string_to_bytes32(form_data.name),
				Number(new Date(form_data.dates)),
				string_to_bytes32(form_data.destination_lon),
				string_to_bytes32(form_data.destination_lat),
				string_to_bytes32(form_data.traffic),
				form_data.people,
				form_data.money,
			],
			{
				from: select_account,
				gas: 6000000,
			}
		);

		console.log(result1);

		close_modal();
	};

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
			<Map
					ref={mapRef}
					center={[24.1, 120.675678]}
					zoom={10}
					style={{height: '300px', width: '100%'}}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					/>
					<Marker position={ [parseFloat(form_data.departure_lon), parseFloat(form_data.departure_lat)]}>
					</Marker>
					<Marker position={ [parseFloat(form_data.destination_lon), parseFloat(form_data.destination_lat)]}>
					</Marker>
				</Map>
			<Form>
                <hr />
                <Form.Group>
                    <Form.Label>姓名</Form.Label>
                    <Form.Control
                        type="text"
                        value={form_data.name || ""}
                        placeholder="請輸入姓名"
                        onChange={(e) => onChange("name", e.target.value)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>日期</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        value={form_data.dates || ""}
                        placeholder="請輸入日期"
                        onChange={(e) => onChange("dates", e.target.value)}
                    />
                </Form.Group>
                <hr />
                <Form.Group>
                    <Form.Label>人數</Form.Label>
                    <Form.Control
                        type="text"
                        value={form_data.people ||""}
                        placeholder="請輸入人數"
                        onChange={(e) => onChange("people", e.target.value)}
                    />
                </Form.Group>
				{/* <Form.Group>
                    <Form.Label>出發地</Form.Label>
                    <Form.Control
                        type="text"
                        value={form_data.destination_lon || ""}
                        placeholder="請輸入出發地"
                        onChange={(e) => onChange("destination_lon", e.target.value)}
                    />
                </Form.Group>
				<Form.Group>
                    <Form.Label>目的地</Form.Label>
                    <Form.Control
                        type="text"
                        value={form_data.destination_lat || ""}
                        placeholder="請輸入目的地"
                        onChange={(e) => onChange("destination_lat", e.target.value)}
                    />
                </Form.Group> */}
                <Form.Group>
                    <Form.Label>價錢/人</Form.Label>
                    <Form.Control
                        type="text"
                        value={form_data.money ||""}
                        placeholder="請輸入價錢/人"
                        onChange={(e) => onChange("money", e.target.value)}
                    />
                </Form.Group>
            
                <Button variant="primary" onClick={onSubmit} block>
                    確定儲存
                </Button>
            </Form>


		</React.Fragment>
	);
};
