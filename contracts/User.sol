// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;
import "./UserAccount.sol";
import "./AccountManager.sol";
import "./LeaseTransaction.sol";
import "./TransactionManager.sol";
import "./Lease.sol";
import "./Global.sol";

contract User {
    bytes32 private uid; //使用者ID
    bytes32 private password; //密碼
    AccountManager private ACM; //帳戶管理員
    LeaseManager private LM; //租借物管理員
    TransactionManager private TM; //交易管理員

    constructor(
        bytes32 _uid,
        bytes32 _password,
        Global g
    ) public {
        require(_uid.length != 0, "Need id");
        require(_password.length != 0, "Need password");

        address acm_addr = g.acm_addr(); //取得帳戶管理員位址
        address lm_addr = g.lm_addr(); //取得租借物管理員位址
        address tm_addr = g.tm_addr(); //取得交易管理員位址
        ACM = AccountManager(acm_addr);
        LM = LeaseManager(lm_addr);
        TM = TransactionManager(tm_addr);

        uid = _uid;
        password = _password;
        ACM.add_account(uid, new UserAccount(this)); //加入帳戶管理
        LM.add_user(uid); //加入租借物管理
        TM.add_user(uid); //加入交易管理
    }

    function get_uid() public view returns (bytes32) {
        return uid;
    }

    function get_password() public view returns (bytes32) {
        return password;
    }

    function set_password(bytes32 _password) public {
        password = _password;
    }

    function get_account() public view returns (address) {
        return ACM.get_account(uid);
    }

    // 新增個人租借物
    function create_lease(
        string memory house_name,
        string memory lon, //經度
        string memory lat, //緯度
        bytes32 lid //房間key
    ) public {
        Lease l = new Lease(this, house_name, lon, lat);
        LM.add_user_lease(l, uid, lid);
    }

    // 新增租借交易
    function create_lease_txn(
        uint256 action,
        address action_user,
        address lease,
        uint256 money
    ) public {
        LeaseTransaction lt;
        uint256 txn_time = now;
        if (action == 1) {
            //租方
            lt = new LeaseTransaction(
                this,
                this,
                User(action_user),
                Lease(lease),
                money,
                txn_time,
                ACM
            );
        } else if (action == 2) {
            //借方
            lt = new LeaseTransaction(
                this,
                User(action_user),
                this,
                Lease(lease),
                money,
                txn_time,
                ACM
            );
        }
        TM.add_user_txn(lt, uid, txn_time); //將交易儲存進自己
        TM.add_user_txn(lt, User(action_user).get_uid(), txn_time); //將交易儲存進action user
    }
}
