pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";

contract UserManager {
    mapping(bytes32 => User) private users; //使用者名稱對應使用者位址
    bytes32[] private user_list; //使用者名稱集合

    function get_user_list()
        public
        view
        returns (bytes32[] memory, address[] memory)
    {
        address[] memory user_addrs = new address[](user_list.length);
        bytes32[] memory uids = new bytes32[](user_list.length);

        for (uint256 i = 0; i < user_list.length; i++) {
            user_addrs[i] = address(users[user_list[i]]);
            uids[i] = users[user_list[i]].get_uid();
        }
        return (uids, user_addrs);
    }

    function add_user(bytes32 uid, address user) public {
        users[uid] = User(user);
        user_list.push(uid);
    }

    function get_user(bytes32 uid)
        public
        view
        returns (
            address,
            bytes32,
            bytes32
        )
    {
        User user = users[uid];
        require(user != User(0), "not exists");
        bytes32 password = user.get_password();

        return (address(user), uid, password);
    }
}
