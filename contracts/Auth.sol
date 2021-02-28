// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./Global.sol";
import "./UserManager.sol";

contract Auth {
    Global private global;
    UserManager private UM;

    constructor(address g) public {
        global = Global(g);
        address um_addr = global.um_addr(); //取得帳戶管理員位址
        UM = UserManager(um_addr);
    }

    function create_user(bytes32 uid, bytes32 password) public {
        User user = new User(uid, password, global);
        UM.add_user(uid, address(user));
    }

    function verify(bytes32 uid, bytes32 password) public view returns (bool) {
        (address user_addr, , ) = UM.get_user(uid);
        User user = User(user_addr);
        return user.get_password() == password;
    }
}
