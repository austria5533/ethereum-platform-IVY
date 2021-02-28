const UserManager = artifacts.require("UserManager");
const AccountManager = artifacts.require("AccountManager");
const LeaseManager = artifacts.require("LeaseManager");
const TransactionManager = artifacts.require("TransactionManager");
const Global = artifacts.require("Global");
const Auth = artifacts.require("Auth");

var fs = require("fs");
var file_path = `${__dirname}/../client/src/eth_contract.json`;
var eth_contract = require(file_path);

module.exports = function (deployer, network, accounts) {
	var UM, ACM, LM, TM, GLOBAL, AUTH;
	deployer
		.then(function () {
			return deployer.deploy(UserManager);
		})
		.then(function (instance) {
			UM = instance.address;
			eth_contract.UserManager = UM;
			return deployer.deploy(AccountManager);
		})
		.then(function (instance) {
			ACM = instance.address;
			eth_contract.AccountManager = ACM;
			return deployer.deploy(LeaseManager);
		})
		.then(function (instance) {
			LM = instance.address;
			eth_contract.LeaseManager = LM;
			return deployer.deploy(TransactionManager);
		})
		.then(function (instance) {
			TM = instance.address;
			eth_contract.TransactionManager = TM;
			return deployer.deploy(Global, UM, ACM, LM, TM);
		})
		.then(function (instance) {
			GLOBAL = instance.address;
			eth_contract.Global = GLOBAL;

			return deployer.deploy(Auth, GLOBAL);
		})
		.then(function (instance) {
			AUTH = instance.address;
			eth_contract.Auth = AUTH;

			fs.writeFile(file_path, JSON.stringify(eth_contract, null, 2), function (err) {
				if (err) return console.log(err);
				console.log(JSON.stringify(eth_contract));
				console.log("writing to " + file_path);
			});
		});
};
