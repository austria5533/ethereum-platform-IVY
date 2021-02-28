pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";

interface Transaction {
    function get_txn_info() external view returns (address[] memory);

    function get_txn_status() external view returns (bool[] memory);

    function get_txn_times() external view returns (uint256[] memory);

    function get_txn_money() external view returns (uint256);

    function complete_txn() external returns (bool);

    function verify_txn(address user_addr)
        external
        view
        returns (string memory);
}
