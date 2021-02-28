import React from "react";
import SearchBar from "../components/SearchBar";
import HouseCard from "../components/HouseCard";
import { connect_to_web3 } from "../utils/getWeb3";
import { getContractInstance } from "../utils/getContract";
import { get_user_all_lease_info } from "../utils/data";
import LeaseManager from "../contracts/LeaseManager.json";
import UserManager from "../contracts/UserManager.json";
import eth_addr from "../eth_contract.json";
import NoContent from "../components/NoContent";
import TravelTab from "../components/TravelTab";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import HouseMap from "../components/HouseMap";
import HouseMapCard from "../components/HouseMapCard";
import { get_data_from_address } from "../utils/api";

export function HouseList() {
	const [web3, set_web3] = React.useState(null);
	const [LM, set_LM] = React.useState(null);
	const [UM, set_UM] = React.useState(null);
	const [user_uid_list, set_user_uid_list] = React.useState([]);
	const [user_addr_list, set_user_addr_list] = React.useState([]);
	const [house_list, set_house_list] = React.useState([]);
	const [selectedIndex, set_selectedIndex] = React.useState(-1);
	const [user, set_user] = React.useState(null);
	const [page, set_page] = React.useState(2);
	const [search_text, set_search_text] = React.useState("");
	const [search_data, set_search_data] = React.useState();
	const history = useHistory();

	//載入web3
	React.useEffect(() => {
		const load = async () => {
			let web3 = await connect_to_web3();
			set_web3(web3);
		};
		load();
	}, []);

	//載入智能合約實體
	React.useEffect(() => {
		const load = async () => {
			if (web3) {
				let instance1 = await getContractInstance(web3, UserManager, eth_addr.UserManager);
				let instance2 = await getContractInstance(
					web3,
					LeaseManager,
					eth_addr.LeaseManager
				);
				set_UM(instance1);
				set_LM(instance2);
			}
		};
		load();
	}, [web3]);

	//載入所有用戶
	React.useEffect(() => {
		const load = async () => {
			if (UM) {
				let list = await UM.methods.get_user_list().call();
				set_user_uid_list(list[0]);
				set_user_addr_list(list[1]);
				console.log(list);
			}
		};
		load();
	}, [UM]);

	//載入User
	React.useEffect(() => {
		let user_str = localStorage.getItem("user");
		if (user_str) {
			let user = JSON.parse(user_str);
			set_user(user);
		}
	}, [web3]);

	//載入所有房間
	React.useEffect(() => {
		load_house_list();
	}, [user_uid_list, user_addr_list]);

	//取得所有房間
	const load_house_list = async () => {
		if (user_uid_list.length > 0 && user_addr_list.length > 0 && LM) {
			let result = [];
			for (let i = 0; i < user_uid_list.length; i++) {
				let user_obj = {
					uid: user_uid_list[i],
					address: user_addr_list[i],
				};
				let lease_infos = await get_user_all_lease_info(web3, user_obj, LM);
				result = result.concat(lease_infos);
			}
			set_house_list(result);
			console.log(result);
		}
	};

	//進入訂房頁面
	const enter_booking_page = (item) => {
		history.push(`/booking/${item.lease_addr}`);
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
			<div className="d-flex flex-column align-items-center pt-5 pb-5">
				<div className="w-50">
					<TravelTab currentPage={1} />
					<SearchBar onChange={onChange} onSubmit={handle_search} />
					<hr color="white" />
				</div>
				<div className="w-50 d-flex justify-content-center mb-3">
					<Button
						className="mr-3"
						variant={page === 1 ? "light" : "outline-light"}
						onClick={(e) => set_page(1)}
					>
						瀏覽列表
					</Button>
					<Button
						className="ml-3"
						variant={page === 2 ? "light" : "outline-light"}
						onClick={(e) => set_page(2)}
					>
						瀏覽地圖
					</Button>
				</div>
				{page === 1 && (
					<React.Fragment>
						<h3 className="text-white-50 mb-3">房間列表瀏覽</h3>
						<div className="w-50">
							{house_list.map((item, i) => {
								return (
									<HouseCard
										key={i}
										owner={item.owner}
										house_name={item.house_name}
										category={item.category}
										rented_out={item.rented_out}
										start_time={item.start_time}
										end_time={item.end_time}
										price={item.price}
										quantity={item.quantity}
										onSubmit={() => enter_booking_page(item)}
									/>
								);
							})}
						</div>
					</React.Fragment>
				)}
				{page === 2 && (
					<div className="row w-100 pl-5 pr-5">
						<div className="col-5">
							{house_list.map((item, i) => {
								return (
									<HouseMapCard
										key={i}
										{...item}
										onSubmit={() => enter_booking_page(item)}
										onClick={() => set_selectedIndex(i)}
									/>
								);
							})}
						</div>
						<div className="col-7" style={{ height: "600px" }}>
							<HouseMap
								house_list={house_list}
								refresh={load_house_list}
								search_data={search_data}
								selectedIndex={selectedIndex}
							/>
						</div>
					</div>
				)}
			</div>
		);
	} else {
		if (!user) {
			return <NoContent message="尚未進行登入..." />;
		}
		return <NoContent message="尚未連結至區塊鏈..." />;
	}
}
