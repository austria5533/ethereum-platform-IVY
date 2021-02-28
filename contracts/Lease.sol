pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";

contract Lease {
    User private owner; //擁有者
    string private house_name; //房屋名稱
    string private category; //種類
    bool private rented_out; //是否已出租
    uint256 private start_time; //可出租起始時間
    uint256 private end_time; //可出租結束時間
    uint256 private price; //出租金額
    uint256 private quantity; //數量
    string private lat; //緯度
    string private lon; //經度

    constructor(
        User u,
        string memory _house_name,
        string memory _lon, //經度
        string memory _lat //緯度
    ) public {
        owner = u;
        house_name = _house_name;
        lon = _lon;
        lat = _lat;
    }

    function get_all_info()
        public
        view
        returns (
            address,
            string memory,
            string memory,
            bool,
            uint256,
            uint256,
            uint256,
            uint256,
            string memory,
            string memory
        )
    {
        address owner_addr = address(owner);
        return (
            owner_addr,
            house_name,
            category,
            rented_out,
            start_time,
            end_time,
            price,
            quantity,
            lon,
            lat
        );
    }

    function rent() public {
        rented_out = true;
    }

    function release() public {
        rented_out = false;
    }

    function update_location(string memory _lon, string memory _lat) public {
        lon = _lon; //經度
        lat = _lat; //緯度
    }

    function update_room_info(
        string memory hn,
        string memory ct,
        uint256 st,
        uint256 et,
        uint256 qt
    ) public {
        house_name = bytes(hn).length != 0 ? hn : house_name;
        category = bytes(ct).length != 0 ? ct : category;
        start_time = st != 0 ? st : start_time;
        end_time = et != 0 ? et : end_time;
        quantity = qt != 0 ? qt : quantity;
    }

    function update_room_price(uint256 pr) public {
        price = pr != 0 ? pr : price;
    }
}
