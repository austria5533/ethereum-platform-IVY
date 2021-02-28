pragma solidity >=0.4.22 <0.8.0;
import "./UserManager.sol";
import "./AccountManager.sol";
import "./LeaseManager.sol";
import "./TransactionManager.sol";

contract Global {
    address public um_addr; //用戶管理合員約位址
    address public acm_addr; //帳戶管理合員約位址
    address public lm_addr; //租借物管理員位址
    address public tm_addr; //交易管理員位址

    constructor(
        address um,
        address acm,
        address lm,
        address tm
    ) public {
        um_addr = um;
        acm_addr = acm;
        lm_addr = lm;
        tm_addr = tm;
    }
}
