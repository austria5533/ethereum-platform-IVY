pragma solidity >=0.4.22 <0.8.0;
import "./Announce.sol";

contract TrafficManager {
    mapping(bytes32 => mapping(bytes32 => Announce)) private user_traffic; //用戶租借物
    mapping(bytes32 => bytes32[]) private user_traffic_list; //用戶所擁有租借物集合
    bytes32[] private user_list; //使用者名稱集合

    function get_user_all_traffic(bytes32 uid)
        public
        view
        returns (bytes32[] memory, address[] memory)
    {
        bytes32[] memory user_lids = user_traffic_list[uid];
        address[] memory traffic_addrs = new address[](user_lids.length);
        for (uint256 i = 0; i < user_lids.length; i++) {
            bytes32 lid = user_lids[i];
            traffic_addrs[i] = address(user_traffic[uid][lid]);
        }
        return (user_lids, traffic_addrs);
    }

    function get_user_lease(bytes32 uid, bytes32 lid)
        public
        view
        returns (address)
    {
        return address(user_traffic[uid][lid]);
    }

    function add_user_traffic(
        Announce l,
        bytes32 uid,
        bytes32 lid
    ) public {
        user_list.push(uid);
        user_traffic_list[uid].push(lid);
        user_traffic[uid][lid] = l;
    }
}
