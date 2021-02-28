const AnnounceManager = artifacts.require("AnnounceManager");

var fs = require("fs");
var file_path = `${__dirname}/../client/src/eth_contract.json`;
var eth_contract = require(file_path);

module.exports = function (deployer) {
  var An;
    deployer
    .then(function () {
      return deployer.deploy(AnnounceManager);
    })
    .then(function (instance) {
      An = instance.address;
      eth_contract.AnnounceManager = An;
      
      fs.writeFile(file_path, JSON.stringify(eth_contract, null, 2), function (err) {
				if (err) return console.log(err);
				console.log(JSON.stringify(eth_contract));
				console.log("writing to " + file_path);
      });
    })
};