pragma solidity >=0.4.22 <0.8.0;
import "./Lease.sol";

contract LeaseManager {
    mapping(bytes32 => mapping(bytes32 => Lease)) private user_leases; //用戶租借物
    mapping(bytes32 => bytes32[]) private user_lease_list; //用戶所擁有租借物集合
    bytes32[] private user_list; //使用者名稱集合

    function get_user_all_leases(bytes32 uid)
        public
        view
        returns (bytes32[] memory, address[] memory)
    {
        bytes32[] memory user_lids = user_lease_list[uid];
        address[] memory lease_addrs = new address[](user_lids.length);
        for (uint256 i = 0; i < user_lids.length; i++) {
            bytes32 lid = user_lids[i];
            lease_addrs[i] = address(user_leases[uid][lid]);
        }
        return (user_lids, lease_addrs);
    }

    function get_user_lease(bytes32 uid, bytes32 lid)
        public
        view
        returns (address)
    {
        return address(user_leases[uid][lid]);
    }

    function add_user(bytes32 uid) public {
        user_list.push(uid);
    }

    function add_user_lease(
        Lease l,
        bytes32 uid,
        bytes32 lid
    ) public {
        user_lease_list[uid].push(lid);
        user_leases[uid][lid] = l;
    }
}
