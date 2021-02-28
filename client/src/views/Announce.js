import React, { Component } from "react";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { InputGroup, FormControl, Button, Dropdown, DropdownButton, Modal, Form, } from "react-bootstrap";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance } from "../utils/getContract";
import AnnounceManager from "../contracts/AnnounceManager.json";
import eth_addr from "../eth_contract.json";
import NoContent from "../components/NoContent";
import { string_to_bytes32, generate_id, convert_dateTime_str } from "../utils/tools";
import TrafficTab from "../components/TrafficTab";
import { Map, Marker, Popup, TileLayer, Polygon, Rectangle } from "react-leaflet";
import { get_data_from_coordinate,get_data_from_address } from "../utils/api";
import SearchBar from "../components/SearchBar";
import { get_all_announce_info ,get_all_user_info} from "../utils/trafficall";

export function Announce({}) {
	const [name, set_name] = React.useState("");
	const [dates, set_dates] = React.useState("");
	const [traffic, set_traffic] = React.useState("");
	const [people, set_people] = React.useState(0);
	const [money, set_money] = React.useState("");
	const [start_lot, set_start_lot] = React.useState("");
	const [start_lat, set_start_lat] = React.useState("");
	const [end_lot, set_end_lot] = React.useState("");
	const [end_lat, set_end_lat] = React.useState("");
	const [select_account, set_select_account] = React.useState(null);
	const [web3, set_web3] = React.useState(null);
	const [accounts, set_accounts] = React.useState([]);
	const [announceManager_contract, set_announceManager_contract] = React.useState(null);
	const [payload, set_payload] = React.useState(null);
	const [user, set_user] = React.useState(null);
	const [position, set_position] = React.useState([24.123206, 120.675679]);
	const [start_position, set_start_position] = React.useState([]); 
	const [start_address, set_start_address] = React.useState("中興大學");
	const [end_position, set_end_position] = React.useState([]); 
	const [end_address, set_end_address] = React.useState("");
	const [zoom, set_zoom] = React.useState(10.5);
	const [search_start_text, set_search_start_text] = React.useState("");
	const [search_end_text, set_search_end_text] = React.useState("");
	const [start_search_data, set_start_search_data] = React.useState();
	const [end_search_data, set_end_search_data] = React.useState();


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
				let contract = await getContractInstance(web3, AnnounceManager, eth_addr.AnnounceManager);
				console.log(contract);
				set_announceManager_contract(contract);
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

	//搜尋地點
	const handle_search = (type) => {
		return async() => {
			if(type === "start" && search_start_text != "") {
				const data = await get_data_from_address(search_start_text);
				if (data) {
					set_start_search_data(data);
				}
				console.log(data);
			} else if(type === 'end' && search_end_text != "") {
				const data = await get_data_from_address(search_end_text);
				if (data) {
					set_end_search_data(data);
				}
				console.log(data);
			}
			
		}
	};

	//更改輸入值
	const onChange = (type, value) => {
		switch (type) {
			case "account":
				set_select_account(value);
				break;
			case "name":
				set_name(value);
				break;
			case "dates":
				set_dates(value);
				break;
			case "start":
				set_search_start_text(value);
				break;
			case "end":
				set_search_end_text(value);
				break;
			case "traffic":
				set_traffic(value);
				break;
			case "people":
				set_people(parseInt(value) > 0 ? parseInt(value) : 0);
				break;
			case "money":
				set_money(value);
				break;
			default:
				break;
		}
	};

	//發布訊息
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
		if (!name) {
			alert("請輸入姓名!");
			return;
		}
		if (!dates) {
			alert("請輸入日期!");
			return;
		}
		if (!start_lat&&!start_lot) {
			alert("請輸入出發地!");
			return;
		}
		if (!end_lot&&!end_lat) {
			alert("請輸入目的地!");
			return;
		}
		if (!traffic) {
			alert("請輸入交通工具!");
			return;
		}
		if (!people) {
			alert("請輸入人數!");
			return;
		}
		if (!money) {
			alert("請輸入價錢/人!");
			return;
		}
		try {
			let _bytes_name = web3.utils.utf8ToHex(name);
			let bytes_name = web3.utils.padRight(_bytes_name, 64);
			// let _bytes_start_lot = web3.utils.utf8ToHex(start_lot);
			// let bytes_start_lot = web3.utils.padRight(_bytes_start_lot, 64);
			// let _bytes_start_lat = web3.utils.utf8ToHex(start_lat);
			// let bytes_start_lat = web3.utils.padRight(_bytes_start_lat, 64);
			// let _bytes_end_lot = web3.utils.utf8ToHex(end_lot);
			// let bytes_end_lot = web3.utils.padRight(_bytes_end_lot, 64);
			// let _bytes_end_lat = web3.utils.utf8ToHex(end_lat);
			// let bytes_end_lat = web3.utils.padRight(_bytes_end_lat, 64);
			let _bytes_traffic = web3.utils.utf8ToHex(traffic);
			let bytes_traffic = web3.utils.padRight(_bytes_traffic, 64);
			// get network ID and the deployed address
			const deployedAddress = eth_addr.AnnounceManager;
			// create the instance
			const instance = new web3.eth.Contract(AnnounceManager.abi, deployedAddress);
			let result = await instance.methods
			.create_announce(
				string_to_bytes32(generate_id(10)), 
				bytes_name,
				Number(new Date(dates)),
				string_to_bytes32(start_lot.toString()),
				string_to_bytes32(start_lat.toString()),
				string_to_bytes32(end_lot.toString()),
				string_to_bytes32(end_lat.toString()),
				bytes_traffic,
				people,
				money,
				user.address
			)
			.send({
				from: select_account,
				gas: 6000000,
			});

			set_payload(JSON.stringify(result));;
			alert("發布成功");
			console.log(result);
		} catch (error) {
			alert("發生錯誤");
			console.log(error);
		}
	};

	const SearchMarker = ({ position, address, onClick }) => {
		return (
			<Marker position={position}>
				<Popup>
					<div className="d-flex flex-column align-items-center justify-content-center">
						<div>{address}</div>
						<Button
							className="mt-2"
							variant="warning"
							size="sm"
							style={{ fontSize: "0.8rem" }}
							onClick={() => onClick(position)}
						>
							確認地點
						</Button>
					</div>
				</Popup>
				
			</Marker>
		);
	};


	//確認出發地
	const confirm_start = (position) => {
		set_start_lot(position[0]);
		set_start_lat(position[1]);	
	};

	//確認目的地
	const confirm_end = (position) => {
		set_end_lot(position[0]);	
		set_end_lat(position[1]);	
	};

	//變更起始位置
	React.useEffect(() => {
		if (start_search_data) {
			const { address, location } = start_search_data;
			set_zoom(18);
			set_start_address(address);
			set_start_position(location);
			set_position(location)
		}
	}, [start_search_data]);

	//變更結束位置
	React.useEffect(() => {
		if (end_search_data) {
			const { address, location } = end_search_data;
			set_zoom(18);
			set_end_address(address);
			set_end_position(location);
			set_position(location)
		}
	}, [end_search_data]);

	if (web3 && user) {
		return (
			<div className="d-flex flex-column justify-content-center align-items-center">
				<div className="w-50 mt-5">
					<TrafficTab currentPage={1} />
				</div>
				<Paper elevation={5} className="w-75 p-3 d-flex flex-column">
					<h1 className="text-center mb-3">{"發布揪團"}</h1>
					<div style={{ height: '600px'}}>
					<React.Fragment>
							<Map
								center={position}
								zoom={zoom}
								style={{ height: "100%" }}
							>
							<TileLayer
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							/>
							
						{start_position.length > 0 && (
							<SearchMarker position={start_position} address={start_address} onClick={confirm_start} />
						)}
						{end_position.length > 0 && (
							<SearchMarker  position={end_position} address={end_address} onClick={confirm_end}/>
						)}
						</Map>
					</React.Fragment>	

					</div>
					<Dropdown className="mb-3">
						<Dropdown.Toggle variant="success" className="w-100">
							{select_account || "選擇帳戶"}
						</Dropdown.Toggle>
						<Dropdown.Menu>
							{accounts.map((item, i) => {
								return (
									<Dropdown.Item
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
							<InputGroup.Text>{"姓名"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入姓名"
							onChange={(e) => onChange("name", e.target.value)}
						/>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"日期"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入日期"
							onChange={(e) => onChange("dates", e.target.value)}
							type="datetime-local"
						/>
					</InputGroup>
					
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"出發地"}</InputGroup.Text>
						</InputGroup.Prepend>
						<SearchBar
							placeholder="請輸入出發地"
							onChange={(e) => onChange("start", e.target.value)}
							onSubmit={handle_search('start')}
						/>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"目的地"}</InputGroup.Text>
						</InputGroup.Prepend>
						{start_lot && start_lat && <SearchBar
							placeholder="請輸入目的地"
							onChange={(e) => onChange("end", e.target.value)}
							onSubmit={handle_search('end')}
						/>}
					</InputGroup>
					
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"人數"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入人數"
							onChange={(e) => onChange("people", e.target.value)}
						>
						</FormControl>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"價錢/人"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="請輸入價錢/人"
							onChange={(e) => onChange("money", e.target.value)}
						/>
					</InputGroup>
					<InputGroup className="mb-3">
						<InputGroup.Prepend>
							<InputGroup.Text>{"交通工具"}</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl as="select"
							placeholder="請輸入交通工具"
							onChange={(e) => onChange("traffic", e.target.value)}
							type="selcet"
						>
						<option>請選擇</option>
						<option>Uber</option>
						<option>計程車</option>
						<option>自駕</option>
						<option>機車</option>
						</FormControl>
					</InputGroup>
					<p className="text-center overflow-auto">{payload || "無資料"}</p>
					<Button
						variant="primary"
						size="lg"
						block
						onClick={onSubmit}
						disabled={!announceManager_contract}
					>
						{"確認送出"}
					</Button>
				</Paper>
			</div>
		);
	} else {
		if (!user) {
			return <NoContent message="尚未進行登入..." />;
		}
		return <NoContent message="尚未連結至區塊鏈..." />;
	}
}

Announce.propTypes = {};
