import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";

function TravelTab({ currentPage }) {
	const history = useHistory();

	//跳轉頁面
	const goToPage = (page) => {
		switch (page) {
			case 1:
				history.push("/houseSearch");
				break;
			case 2:
				history.push("/myHouse");
				break;
			case 3:
				history.push("/txnList");
				break;
			case 4:
				history.push("/account");
				break;
			default:
		}
	};

	return (
		<React.Fragment>
			<div className="d-flex justify-content-around w-100">
				<Button
					variant={currentPage === 1 ? "warning" : "outline-warning"}
					onClick={(e) => goToPage(1)}
				>
					我要訂房
				</Button>
				<Button
					variant={currentPage === 2 ? "warning" : "outline-warning"}
					onClick={(e) => goToPage(2)}
				>
					我有房間
				</Button>
				<Button
					variant={currentPage === 3 ? "warning" : "outline-warning"}
					onClick={(e) => goToPage(3)}
				>
					交易資訊
				</Button>
				<Button
					variant={currentPage === 4 ? "warning" : "outline-warning"}
					onClick={(e) => goToPage(4)}
				>
					帳戶管理
				</Button>
			</div>
			<hr className="border-warning w-100" />
		</React.Fragment>
	);
}

TravelTab.propTypes = {};

export default TravelTab;
