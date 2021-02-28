pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";


contract TrafficTransaction {
    address public owner;
    User private u;

     modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    constructor(
        User _u
    ) public {
        u=_u;
    }

     function get_u() public view returns (User _u) {
        return u;
    }

    function set_u(User _u) public {
       u = _u;
    }
}
