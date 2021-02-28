pragma solidity >=0.4.22 <0.8.0;
import "./LeaseTransaction.sol";
import "./User.sol";

contract TransactionManager {
    mapping(bytes32 => mapping(uint256 => LeaseTransaction)) private user_txns; //用戶租交易
    mapping(bytes32 => uint256[]) private user_txn_list; //用戶所有交易集合
    bytes32[] private user_list; //使用者名稱集合

    function get_user_all_txns(bytes32 uid)
        public
        view
        returns (uint256[] memory, address[] memory)
    {
        uint256[] memory txn_times = user_txn_list[uid];
        address[] memory txn_addrs = new address[](txn_times.length);
        for (uint256 i = 0; i < txn_times.length; i++) {
            uint256 time = txn_times[i];
            txn_addrs[i] = address(user_txns[uid][time]);
        }
        return (txn_times, txn_addrs);
    }

    function get_user_txn(bytes32 uid, uint256 time)
        public
        view
        returns (address)
    {
        return address(user_txns[uid][time]);
    }

    function add_user(bytes32 uid) public {
        user_list.push(uid);
    }

    function add_user_txn(
        LeaseTransaction lt,
        bytes32 uid,
        uint256 time
    ) public {
        user_txn_list[uid].push(time);
        user_txns[uid][time] = lt;
    }
}
