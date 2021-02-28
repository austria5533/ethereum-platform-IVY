// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;
import "./User.sol";
import "./Announce.sol";
import "./TrafficTransaction.sol";


contract AnnounceManager {
    mapping(address => bytes32[]) private UserAnnounces; //使用者的所有相關貼文
    mapping(address => address[]) private UserAnnounces1; //使用者的所有相關貼文
    mapping(bytes32 => Announce) private AnnounceCollection; //所有發布貼文
    bytes32[] private announce_id_list; //所有貼文id

    function create_announce(
        bytes32 announce_id,
        bytes32 name,
        uint256 dates,
        bytes32 departure_lon, 
        bytes32 departure_lat, 
        bytes32 destination_lon, 
        bytes32 destination_lat,
        bytes32 traffic,
        uint256 people,
        uint256 money,
        address user_addr
    ) public {
        Announce announce = new Announce(name, dates,departure_lon,departure_lat,destination_lon, destination_lat, traffic,people,money,User(user_addr));
        AnnounceCollection[announce_id] = announce;
        announce_id_list.push(announce_id);
    }
    
    function get_announce(bytes32 announce_id)
        public
        view
        returns (bytes32 _name, uint256 _dates, bytes32 _traffic, uint256 _people, uint256 _people_count, uint256 _money,User _u)
    {
        uint256 people;
        uint256 people_count;
        Announce announce = AnnounceCollection[announce_id];
        bytes32 name = announce.get_name();
        uint256 dates = announce.get_dates();
        bytes32 traffic = announce.get_traffic();
        (people, people_count) = announce.get_people();
        uint256 money = announce.get_money();
        User user = announce.get_u();
        return (name, dates, traffic, people, people_count, money,user);
    }
    
     function get_announce_destination(bytes32 announce_id)
        public
        view
        returns ( bytes32 _departure_lon,bytes32 _departure_lat,bytes32 _destination_lon,bytes32 _destination_lat,User _u)
    {
        Announce announce = AnnounceCollection[announce_id];
        bytes32 departure_lon = announce.get_departure_lon();
        bytes32 departure_lat = announce.get_departure_lat();
        bytes32 destination_lon = announce.get_destination_lon();
        bytes32 destination_lat = announce.get_destination_lat();
        User user = announce.get_u();
        return (departure_lon,departure_lat,destination_lon,destination_lat,user);
    }
    
     function get_announce_total_money(bytes32 announce_id)
        public
        view
        returns ( uint256 _total_money)
    {
        Announce announce = AnnounceCollection[announce_id];
        uint256 total_money = announce.get_total_money();
        return (total_money);
    }
    
     function get_all_announces()
        public
        view
        returns (bytes32[] memory ,address[] memory)
    {
        address[] memory announce_addr_list = new address[](announce_id_list.length);
       for (uint256 i = 0; i < announce_id_list.length; i++) {
            announce_addr_list[i] = address(AnnounceCollection[announce_id_list[i]]);
        }
        return (announce_id_list ,announce_addr_list);
    }
    
    
    function join_announce(bytes32 announce_id,address announce_addr, address user_addr) public
    {
        Announce announce = AnnounceCollection[announce_id];
        announce.add_people(user_addr);
        UserAnnounces[user_addr].push(announce_id);
        UserAnnounces1[user_addr].push(announce_addr);
    }
    
    
    
    function get_user_all_announce(address user_addr) public view returns(bytes32[] memory,address[] memory) {
        return (UserAnnounces[user_addr],UserAnnounces1[user_addr]);
    }

}
