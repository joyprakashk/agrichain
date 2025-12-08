// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AgriChainTrace {
    struct Order {
        bytes32 traceId;
        address farmer;
        string productName;
        uint256 quantity;
        uint256 timestamp;
        string status;
        bool exists;
    }
    
    mapping(bytes32 => Order) public orders;
    mapping(address => bytes32[]) public farmerOrders;
    
    event OrderRegistered(bytes32 indexed traceId, address indexed farmer, string productName);
    event StatusUpdated(bytes32 indexed traceId, string newStatus);
    
    function registerOrder(
        string memory _productName,
        uint256 _quantity,
        string memory _orderData
    ) external returns (bytes32) {
        bytes32 traceId = keccak256(abi.encodePacked(
            msg.sender,
            _productName,
            _quantity,
            block.timestamp,
            _orderData
        ));
        
        require(!orders[traceId].exists, "Order already exists");
        
        orders[traceId] = Order({
            traceId: traceId,
            farmer: msg.sender,
            productName: _productName,
            quantity: _quantity,
            timestamp: block.timestamp,
            status: "registered",
            exists: true
        });
        
        farmerOrders[msg.sender].push(traceId);
        
        emit OrderRegistered(traceId, msg.sender, _productName);
        return traceId;
    }
    
    function updateStatus(bytes32 _traceId, string memory _newStatus) external {
        require(orders[_traceId].exists, "Order does not exist");
        require(orders[_traceId].farmer == msg.sender, "Only farmer can update");
        
        orders[_traceId].status = _newStatus;
        emit StatusUpdated(_traceId, _newStatus);
    }
    
    function getOrder(bytes32 _traceId) external view returns (Order memory) {
        require(orders[_traceId].exists, "Order does not exist");
        return orders[_traceId];
    }
}