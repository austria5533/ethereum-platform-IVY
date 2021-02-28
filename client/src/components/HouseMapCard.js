import React from "react";
import Paper from "@material-ui/core/Paper";

function HouseMapCard({ house_name, price, onSubmit, onClick }) {
	const [random_key, set_random_key] = React.useState(0);
	const [random_score, set_random_score] = React.useState(0);
	const [random_review, set_random_review] = React.useState(0);
	React.useEffect(() => {
		set_random_key(Math.round(Math.random() * 1000 + 1));
		set_random_score(Math.round(Math.random() * 5 + 5).toFixed(1));
		set_random_review(Math.round(Math.random() * 200 + 100));
	}, []);
	return (
		<Paper className="house-map-card" elevation={3}>
			<img src={`https://source.unsplash.com/random?sig=${random_key}`} onClick={onClick} />
			<div className="content-container">
				<h3 className="title mb-1">{house_name}</h3>
				<span className="star mb-1">
					<i className="fas fa-star"></i>
					<i className="fas fa-star"></i>
					<i className="fas fa-star"></i>
					<i className="fas fa-star"></i>
					<i className="fas fa-star"></i>
				</span>
				<div className="review-container mb-1">
					<div className="score">{random_score}</div>
					<div className="d-flex flex-column ml-1">
						<span className="review-text">很讚</span>
						<span className="review-count">{`${random_review}篇評鑑`}</span>
					</div>
				</div>
				<div className="wifi mb-1">
					<i className="fas fa-wifi mr-1"></i>Wi-Fi
				</div>
				<div className="bottom-right-container mb-2">
					<span className="price">{`NT$${price}`}</span>
					<span className="price-msg">每晚低至</span>
					<a className="order-btn" onClick={onSubmit}>
						立即預定
					</a>
				</div>
			</div>
		</Paper>
	);
}

export default HouseMapCard;
