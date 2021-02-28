import { Home } from "./views/Home";
import { Login } from "./views/Login";
import { Announce } from "./views/Announce";
import { MyHouse } from "./views/MyHouse";
import { TrafficPublish } from "./views/TrafficPublish";
import { UserTrafficPublish } from "./views/UserTrafficPublish";
import { TrafficConfirmList } from "./views/TrafficConfirmList";
import { TrafficTransaction } from "./views/TrafficTransaction";
import { Account } from "./views/Account";
import { HouseList } from "./views/HouseList";
import { TransactionList } from "./views/TransactionList";
import { Booking } from "./views/Booking";

export const routes = [
	{
		path: "/",
		name: "首頁",
		component: Home,
	},
	{
		path: "/home",
		name: "首頁",
		component: Home,
	},
	{
		path: "/login",
		name: "登入",
		component: Login,
	},
	{
		path: "/Announce",
		name: "發布",		
		component: Announce,
	},
	{
		path: "/TrafficPublish",
		name: "發布列表",		
		component: TrafficPublish,
	},
	{
		path: "/UserTrafficPublish",
		name: "User發布的揪團列表",		
		component: UserTrafficPublish,
	},
	{
		path: "/TrafficConfirmList",
		name: "跟團資訊",		
		component: TrafficConfirmList,
	},
	{
		path: "/TrafficTransaction",
		name: "交易資訊",		
		component: TrafficTransaction,
	},
	{
		path: "/account",
		name: "帳戶管理",
		component: Account,
	},
	{
		path: "/houseSearch",
		name: "房間列表",
		component: HouseList,
	},
	{
		path: "/myHouse",
		name: "我的房間",
		component: MyHouse,
	},
	{
		path: "/txnList",
		name: "我的交易",
		component: TransactionList,
	},
	{
		path: "/booking/:id",
		name: "我要訂房",
		component: Booking,
	},
];
