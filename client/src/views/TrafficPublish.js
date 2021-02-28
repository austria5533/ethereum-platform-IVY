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
import { get_all_announce_info ,get_all_user_info} from "../utils/trafficall";
import { string_to_bytes32, generate_id, convert_dateTime_str } from "../utils/tools";
import moment from "moment";
import { useHistory, useLocation, useParams } from "react-router-dom";
import User from "../contracts/User.json";
import TrafficCard from "../components/TrafficCard";
import { Map, Marker, Popup, TileLayer, Polygon, Rectangle } from "react-leaflet";
import { get_data_from_coordinate,get_data_from_address } from "../utils/api";

export function TrafficPublish(props) {
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [An, set_An] = React.useState(null);
	const [user, set_user] = React.useState(null);
	const [user_contract, set_user_contract] = React.useState(null);
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

	//載入智能合約實體
	React.useEffect(() => {
		const load = async () => {
			if (web3 && user) {
				let instance1 = await getContractInstance(web3, AnnounceManager, eth_addr.AnnounceManager);
				let user_contract = await getContractInstance(web3, User, user.address);
				set_An(instance1);
				console.log(instance1);
				set_user_contract(user_contract);
				console.log(user_contract);
			}
		};
		load();
	}, [web3, id,user]);
	

	if (web3 && user) {
		return (
			<div className="d-flex flex-column align-items-center pt-5">
				<div className="w-50">
					<TrafficTab currentPage={2} />
				</div>
				<div className="w-50 mb-3">
					<TrafficList accounts={accounts} web3={web3} An={An}  user={user} />
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

const TrafficList = ({ accounts, web3, An ,user}) => {
	const [current_data, set_current_data] = React.useState({});
	const [open, set_open] = React.useState(null);
	const [traffic_list, set_traffic_list] = React.useState([]);
	const mapRef = React.useRef()

	//初始載入
	React.useEffect(() => {
		load_user_traffic();
	}, [An,web3]);

	//取得使用者所有揪團列表
	const load_user_traffic = async () => {
		if (web3 && An) {
				let list = await get_all_announce_info(An);
					set_traffic_list(list);
				console.log(list);			
		}
	};

	//開啟視窗
	const open_modal = async (item) => {
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
			<h3 className="text-white-50">所有揪團列表</h3>;
				<ListGroup className="col-8">
					{traffic_list.map((item, i) => {
						return (
							<TrafficCard
										key={i}
										{...item}
										onSubmit={() => open_modal(item)}
									/>
						);
					})}
				</ListGroup>
			
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
						
						user={user}
						An={An}
						accounts={accounts}
						traffic_data={current_data}
						close_modal={close_modal}
						mapRef={mapRef}
					/>
				</Modal.Body>
				<Modal.Footer></Modal.Footer>
			</Modal>
		</div>
	);
};

const UpdateHouse = ({ accounts, traffic_data, close_modal, An, user, mapRef }) => {
	const [form_data, set_form_data] = React.useState({});
	const [select_account, set_select_account] = React.useState(null);
	const history = useHistory();
	const [position, set_position] = React.useState([24.123206, 120.675679]);
	const [start_position, set_start_position] = React.useState([]);
	const [zoom, set_zoom] = React.useState(10.5);
	const [address, set_address] = React.useState("");

	//載入表單資料
	React.useEffect(() => {
		set_form_data({
			...traffic_data,
			 dates: convert_dateTime_str(traffic_data.dates),
		});

	}, [traffic_data]);
	console.log(traffic_data);


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
		if (user.address === traffic_data.u) {
			alert("您是貼文發布者，不能跟團");
			return;
		}
		else if(traffic_data.people-traffic_data.people_count===0)
		{
			alert("跟團已滿無法跟單");
		}
		else
		{
			//更新確認跟單
			let result1 = await contract_send(
			An,
			"join_announce",
			[
				string_to_bytes32(traffic_data.traffic_id),
				traffic_data.traffic_addr,
				user.address
			],
			{
				from: select_account,
				gas: 6000000,
			}
			);		 
			console.log(result1);
			// console.log(result2);
			alert("跟團成功");
			history.push("/TrafficConfirmList");
		}
				
			
		close_modal();
	};
	return (
		<div className="w-100">
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
				<Form.Group>
					<Form.Label>姓名 : {`${form_data.name}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label type="datetime-local">日期 : {`${convert_dateTime_str(form_data.dates)}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>交通工具 : {`${form_data.traffic}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>人數 : {`${form_data.people}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>價錢/人 : {`${form_data.money}`}</Form.Label>
				</Form.Group>
				{/* <Form.Group>
					<Form.Label>出發地 : {`${parseFloat(form_data.destination_lon)}`}</Form.Label>
				</Form.Group>
				<Form.Group>
					<Form.Label>目的地 : {`${parseFloat(form_data.destination_lat)}`}</Form.Label>
				</Form.Group> */}
				<Form.Group>
					<Form.Label>剩餘人數 : {`${form_data.people - form_data.people_count}`}</Form.Label>
				</Form.Group>
				<Button variant="primary" onClick={onSubmit} block>
					確定跟團
				</Button>
			</Form>
			
		</div>
	);
};
