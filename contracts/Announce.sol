pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./UserAccount.sol";

contract Announce {
    bytes32 private name;
    uint256 private dates;
    bytes32 private departure;
    bytes32 private departure_lon;
    bytes32 private departure_lat;
    bytes32 private destination;
    bytes32 private destination_lon;
    bytes32 private destination_lat;
    bytes32 private traffic;
    uint256 private money;
    uint256 private people; //可乘車人數
    uint256 public people_count = 0; //目前下單人數
    bool public close = false;
    User private u; //發文的人
    User[] private joined_users; //已經下單的人
    uint256 private total_money = 0;
    mapping(address => bool) private pay_completed; //跟單者已完成
    bytes32 private account;

    constructor(
        bytes32 _name,
        uint256 _dates,
        // bytes32 _departure,
        bytes32 _departure_lon,
        bytes32 _departure_lat,
        // bytes32 _destination,
        bytes32 _destination_lon,
        bytes32 _destination_lat,
        bytes32 _traffic,
        uint256 _people,
        uint256 _money,
        User _u
    ) public {
        // require(_owner != address(0x0), "Need owner");
        require(_name.length != 0, "Need name");
        //require(_dates.length != 0, "Need dates");
        // require(_destination_lon.length != 0, "Need destination");
        // require(_destination_lat.length != 0, "Need destination");
        require(_traffic.length != 0, "Need traffic");
        //require(_people.length != 0, "Need people");
        // require(_money.length != 0, "Need money");

        // owner = _owner;
        name = _name;
        dates = _dates;
        // departure = _departure;
        departure_lon = _departure_lon;
        departure_lat = _departure_lat;
        // destination = _destination;
        destination_lon = _destination_lon;
        destination_lat = _destination_lat;
        traffic = _traffic;
        people = _people;
        money = _money;
        u=_u;
        
    }

    function get_name() public view returns (bytes32 _name) {
        return name;
    }

    function set_name(bytes32 _name) public {
        name = _name;
    }

    function get_dates() public view returns (uint256 _dates) {
        return dates;
    }

    function set_dates(uint256 _dates) public {
       dates = _dates;
    }
    
     function get_destination()  public view returns (bytes32 _destination) {
        return destination;
    }

    function set_destination(bytes32 _destination) public {
        destination = _destination;
    }

    function get_destination_lon()  public view returns (bytes32 _destination_lon) {
        return destination_lon;
    }

    function set_destination_lon(bytes32 _destination_lon) public {
        destination_lon = _destination_lon;
    }
    
     function get_destination_lat()  public view returns (bytes32 _destination_lat) {
        return destination_lat;
    }

    function set_destination_lat(bytes32 _destination_lat) public {
        destination_lat = _destination_lat;
    }
    
     function get_departure()  public view returns (bytes32 _departure) {
        return departure;
    }

    function set_departure(bytes32 _departure) public {
        departure = _departure;
    }

    function get_departure_lon()  public view returns (bytes32 _departure_lon) {
        return departure_lon;
    }

    function set_departure_lon(bytes32 _departure_lon) public {
        departure_lon = _departure_lon;
    }
    
     function get_departure_lat()  public view returns (bytes32 _departure_lat) {
        return departure_lat;
    }

    function set_departure_lat(bytes32 _departure_lat) public {
        departure_lat = _departure_lat;
    }

    function get_traffic() public view returns (bytes32 _traffic) {
        return traffic;
    }

    function set_traffic(bytes32 _traffic) public {
       traffic = _traffic;
    }

    function get_people() public view returns (uint256, uint256) {
        return (people, people_count);
    }

    function set_people(uint256 _people) public {
       people = _people;
    }

    function get_money() public view returns (uint256 _money) {
        return money;
    }

    function set_money(uint256 _money) public {
       money = _money;
    }
    
    function get_u() public view returns (User _u) {
        return u;
    }

    function set_u(User _u) public {
       u = _u;
    }
    
    
      function update_announce_info(
        bytes32 _name, 
        uint256 _dates, 
        bytes32 _destination_lon, 
        bytes32 _destination_lat, 
        bytes32 _traffic,
        uint256 _people, 
        uint256 _money)
        public
    {
        name =  _name ;
        dates = _dates ;
        destination_lon = _destination_lon;
        destination_lat = _destination_lat;
        traffic =  _traffic;
        people = _people;
        money = _money;
    }

    function add_people(address user_addr) public {
        if(!close) {
            people_count += 1;
            joined_users.push(User(user_addr));
            if(people == people_count) {
                close = true;
            }
        }
    }


    function get_joined_users() public view returns(User[] memory) {
        return joined_users;
    }
    
    
    function get_all_user_pay_completed(address user_addr) public view returns(bool) {
        return pay_completed[user_addr];
    }
    
    function transfer_money(address user_addr) public {
        UserAccount uc = UserAccount(User(user_addr).get_account());
        uc.set_balance(uc.get_balance() - money); //減少使用者帳戶餘額
        total_money += money; //增加訂單總金額
    }
    
    function get_total_money() public view returns (uint256) {
        return total_money;
    }
    
    function announce_compileted() public {
        UserAccount uc = UserAccount(User(u).get_account());
        uc.set_balance(uc.get_balance() + total_money); //增加使用者帳戶餘額
    }
  
    
}
