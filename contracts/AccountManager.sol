pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./UserAccount.sol";

contract AccountManager {
    mapping(bytes32 => UserAccount) private accounts; //使用者名稱對應帳戶位址
    bytes32[] private user_list; //使用者名稱集合

    function get_account_list()
        public
        view
        returns (bytes32[] memory, address[] memory)
    {
        address[] memory account_addrs = new address[](user_list.length);
        bytes32[] memory uids = new bytes32[](user_list.length);

        for (uint256 i = 0; i < user_list.length; i++) {
            account_addrs[i] = address(accounts[user_list[i]]);
            uids[i] = user_list[i];
        }
        return (uids, account_addrs);
    }

    function add_account(bytes32 uid, UserAccount account) public {
        accounts[uid] = account;
        user_list.push(uid);
    }

    function get_account(bytes32 _uid) public view returns (address) {
        return address(accounts[_uid]);
    }
}
