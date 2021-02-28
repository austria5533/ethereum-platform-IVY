pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./Transaction.sol";
import "./Lease.sol";
import "./Global.sol";
import "./AccountManager.sol";
import "./UserAccount.sol";

//實作 Transaction
contract LeaseTransaction is Transaction {
    User public sender;
    User private renter;
    User private borrower;
    Lease private lease;
    uint256 private money;
    bool private renter_check = false; //出租方確認
    bool private borrower_check = false; //租借方確認
    bool private complete = false; //訂單完成
    uint256 private start_time; //訂單開始時間
    uint256 private end_time; //訂單結束時間
    AccountManager private ACM; //帳戶管理員
 
    constructor(
        User s,
        User r,
        User b,
        Lease l,
        uint256 m,
        uint256 st,
        AccountManager acm
    ) public {
        sender = s;
        renter = r;
        borrower = b;
        lease = l;
        money = m;
        start_time = st;
        ACM = acm;
    }

    function get_txn_info() public override view returns (address[] memory) {
        address[] memory info = new address[](4);
        info[0] = address(sender);
        info[1] = address(renter);
        info[2] = address(borrower);
        info[3] = address(lease);

        return info;
    }

    function get_txn_status() public override view returns (bool[] memory) {
        bool[] memory status = new bool[](3);
        status[0] = renter_check;
        status[1] = borrower_check;
        status[2] = complete;
        return status;
    }

    function get_txn_times() public override view returns (uint256[] memory) {
        uint256[] memory times = new uint256[](2);
        times[0] = start_time;
        times[1] = end_time;
        return times;
    }

    function get_txn_money() public override view returns (uint256) {
        return money;
    }

    function transfer_money() private {
        UserAccount renter_account = UserAccount(
            ACM.get_account(renter.get_uid())
        );
        UserAccount borrower_account = UserAccount(
            ACM.get_account(borrower.get_uid())
        );
        renter_account.send_money(borrower_account, money);
    }

    function complete_txn() public override returns (bool) {
        if (!complete && renter_check && borrower_check) {
            transfer_money();
            end_time = now;
            complete = true;
            return true;
        } else {
            return false;
        }
    }

    function verify_txn(address user_addr)
        public
        override
        view
        returns (string memory)
    {
        string memory identity;
        if (user_addr == address(renter)) {
            identity = "租方";
        } else if (user_addr == address(borrower)) {
            identity = "借方";
        } else if (user_addr == address(sender)) {
            identity = "交易發起方";
        }

        return identity;
    }

    function check_txn(address user_addr) public {
        uint256 user_type = 0;
        if (user_addr == address(renter)) {
            user_type = 1; //出租者
        } else if (user_addr == address(borrower)) {
            user_type = 2; //租借者
        }

        if (user_type == 1) {
            renter_check = true;
        } else if (user_type == 2) {
            borrower_check = true;
        }
    }
}
