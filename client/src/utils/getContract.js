//取得合約實體
export const getContractInstance = async (web3, contractDefinition, address) => {
	// get network ID and the deployed address
	const networkId = await web3.eth.net.getId();
	const deployedAddress = address || contractDefinition.networks[networkId].address;

	// create the instance
	const instance = new web3.eth.Contract(contractDefinition.abi, deployedAddress);
	return instance;
};

//呼叫合約call
export const contract_call = async (contract, method, params = [], options = {}) => {
	try {
		let result = await contract.methods[method](...params).call(options);
		return result;
	} catch (error) {
		console.log(error);
		return false;
	}
};

//呼叫合約send
export const contract_send = async (contract, method, params, options = {}) => {
	try {
		let result = await contract.methods[method](...params).send(options);
		return result;
	} catch (error) {
		console.log(error);
		return false;
	}
};
