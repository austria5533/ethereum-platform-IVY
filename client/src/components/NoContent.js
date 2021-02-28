import React from "react";

export default function NoContent({ message }) {
	return (
		<div className="d-flex h-75 justify-content-center align-items-center">
			<h1 style={{ color: "white" }}>{message}</h1>
		</div>
	);
}
