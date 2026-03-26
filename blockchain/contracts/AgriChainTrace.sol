// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AgriChainTrace {
    // Enum for supply chain stages
    enum SupplyChainStage {
        Harvested,
        Packaged,
        InTransitToRetailer,
        ReceivedByRetailer,
        StoredInRetail,
        ListedForSale,
        Purchased,
        Delivered,
        Completed
    }
    
    // Struct for Order/Product
    struct Order {
        bytes32 traceId;
        address farmer;
        address retailer;
        address consumer;
        string productName;
        uint256 quantity;
        uint256 timestamp;
        uint256 price; // Price in wei
        SupplyChainStage currentStage;
        string[] stageHistory;
        uint256[] stageTimestamps;
        string metadata;
        bool exists;
    }
    
    // Struct for Retailer
    struct Retailer {
        address retailerAddress;
        string name;
        string licenseNumber;
        string gstNumber;
        bool isVerified;
        uint256 registeredAt;
        uint256 totalProductsReceived;
        uint256 totalProductsSold;
        uint256 rating;
        uint256 totalRatings;
        bool exists;
    }
    
    // Struct for Farmer
    struct Farmer {
        address farmerAddress;
        string name;
        string aadhaarHash;
        bool isVerified;
        uint256 registeredAt;
        uint256 totalProducts;
        uint256 totalDelivered;
        bool exists;
    }
    
    // Mappings
    mapping(bytes32 => Order) public orders;
    mapping(address => bytes32[]) public farmerOrders;
    mapping(address => bytes32[]) public retailerOrders;
    mapping(address => Retailer) public retailers;
    mapping(address => Farmer) public farmers;
    mapping(address => bool) public isRegisteredFarmer;
    mapping(address => bool) public isRegisteredRetailer;
    
    // Events
    event FarmerRegistered(address indexed farmer, string name, uint256 timestamp);
    event RetailerRegistered(address indexed retailer, string name, string licenseNumber, uint256 timestamp);
    event OrderRegistered(bytes32 indexed traceId, address indexed farmer, string productName, uint256 timestamp);
    event OrderTransferredToRetailer(bytes32 indexed traceId, address indexed retailer, uint256 timestamp);
    event OrderReceivedByRetailer(bytes32 indexed traceId, address indexed retailer, string inspectionStatus, uint256 timestamp);
    event OrderListedForSale(bytes32 indexed traceId, address indexed retailer, uint256 price, uint256 timestamp);
    event OrderPurchased(bytes32 indexed traceId, address indexed consumer, uint256 price, uint256 timestamp);
    event StageUpdated(bytes32 indexed traceId, SupplyChainStage newStage, uint256 timestamp);
    event OrderDelivered(bytes32 indexed traceId, address indexed consumer, uint256 timestamp);
    
    // Modifiers
    modifier onlyFarmer(bytes32 _traceId) {
        require(orders[_traceId].exists, "Order does not exist");
        require(orders[_traceId].farmer == msg.sender, "Only farmer can perform this action");
        _;
    }
    
    modifier onlyRetailer(bytes32 _traceId) {
        require(orders[_traceId].exists, "Order does not exist");
        require(orders[_traceId].retailer == msg.sender, "Only assigned retailer can perform this action");
        _;
    }
    
    modifier onlyRegisteredFarmer() {
        require(isRegisteredFarmer[msg.sender], "Not a registered farmer");
        _;
    }
    
    modifier onlyRegisteredRetailer() {
        require(isRegisteredRetailer[msg.sender], "Not a registered retailer");
        _;
    }
    
    // ============================
    // FARMER REGISTRATION
    // ============================
    
    function registerFarmer(
        string memory _name,
        string memory _aadhaarHash
    ) external {
        require(!isRegisteredFarmer[msg.sender], "Farmer already registered");
        require(bytes(_name).length > 0, "Name required");
        
        farmers[msg.sender] = Farmer({
            farmerAddress: msg.sender,
            name: _name,
            aadhaarHash: _aadhaarHash,
            isVerified: true,
            registeredAt: block.timestamp,
            totalProducts: 0,
            totalDelivered: 0,
            exists: true
        });
        
        isRegisteredFarmer[msg.sender] = true;
        
        emit FarmerRegistered(msg.sender, _name, block.timestamp);
    }
    
    // ============================
    // RETAILER REGISTRATION
    // ============================
    
    function registerRetailer(
        string memory _name,
        string memory _licenseNumber,
        string memory _gstNumber
    ) external {
        require(!isRegisteredRetailer[msg.sender], "Retailer already registered");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_licenseNumber).length > 0, "License number required");
        
        retailers[msg.sender] = Retailer({
            retailerAddress: msg.sender,
            name: _name,
            licenseNumber: _licenseNumber,
            gstNumber: _gstNumber,
            isVerified: true,
            registeredAt: block.timestamp,
            totalProductsReceived: 0,
            totalProductsSold: 0,
            rating: 0,
            totalRatings: 0,
            exists: true
        });
        
        isRegisteredRetailer[msg.sender] = true;
        
        emit RetailerRegistered(msg.sender, _name, _licenseNumber, block.timestamp);
    }
    
    // ============================
    // ORDER REGISTRATION (FARMER)
    // ============================
    
    function registerOrder(
        string memory _productName,
        uint256 _quantity,
        string memory _metadata
    ) external onlyRegisteredFarmer returns (bytes32) {
        // Generate unique traceId
        bytes32 traceId = keccak256(abi.encodePacked(
            msg.sender,
            _productName,
            _quantity,
            block.timestamp,
            _metadata
        ));
        
        require(!orders[traceId].exists, "Order already exists");
        
        // Initialize stage history arrays
        string[] memory initialStages = new string[](1);
        initialStages[0] = "Harvested";
        
        uint256[] memory initialTimestamps = new uint256[](1);
        initialTimestamps[0] = block.timestamp;
        
        orders[traceId] = Order({
            traceId: traceId,
            farmer: msg.sender,
            retailer: address(0),
            consumer: address(0),
            productName: _productName,
            quantity: _quantity,
            timestamp: block.timestamp,
            price: 0,
            currentStage: SupplyChainStage.Harvested,
            stageHistory: initialStages,
            stageTimestamps: initialTimestamps,
            metadata: _metadata,
            exists: true
        });
        
        farmerOrders[msg.sender].push(traceId);
        
        // Update farmer stats
        farmers[msg.sender].totalProducts++;
        
        emit OrderRegistered(traceId, msg.sender, _productName, block.timestamp);
        emit StageUpdated(traceId, SupplyChainStage.Harvested, block.timestamp);
        
        return traceId;
    }
    
    // ============================
    // SUPPLY CHAIN STAGE UPDATES
    // ============================
    
    // Farmer packages the product
    function updateToPackaged(bytes32 _traceId) external onlyFarmer(_traceId) {
        Order storage order = orders[_traceId];
        require(order.currentStage == SupplyChainStage.Harvested, "Invalid stage transition");
        
        _updateStage(order, SupplyChainStage.Packaged);
    }
    
    // Farmer transfers to retailer (assigns retailer)
    function transferToRetailer(bytes32 _traceId, address _retailer) external onlyFarmer(_traceId) {
        require(isRegisteredRetailer[_retailer], "Retailer not registered");
        
        Order storage order = orders[_traceId];
        require(order.retailer == address(0), "Retailer already assigned");
        
        order.retailer = _retailer;
        retailerOrders[_retailer].push(_traceId);
        
        // Update retailer stats
        retailers[_retailer].totalProductsReceived++;
        
        _updateStage(order, SupplyChainStage.InTransitToRetailer);
        
        emit OrderTransferredToRetailer(_traceId, _retailer, block.timestamp);
    }
    
    // Retailer receives product
    function receiveProduct(bytes32 _traceId, string memory _inspectionStatus) external onlyRetailer(_traceId) {
        Order storage order = orders[_traceId];
        require(order.currentStage == SupplyChainStage.InTransitToRetailer, "Product not in transit");
        
        _updateStage(order, SupplyChainStage.ReceivedByRetailer);
        
        emit OrderReceivedByRetailer(_traceId, msg.sender, _inspectionStatus, block.timestamp);
    }
    
    // Retailer stores product
    function storeProduct(bytes32 _traceId) external onlyRetailer(_traceId) {
        Order storage order = orders[_traceId];
        require(order.currentStage == SupplyChainStage.ReceivedByRetailer, "Product not received");
        
        _updateStage(order, SupplyChainStage.StoredInRetail);
    }
    
    // Retailer lists product for sale
    function listProductForSale(bytes32 _traceId, uint256 _price) external onlyRetailer(_traceId) {
        Order storage order = orders[_traceId];
        require(order.currentStage == SupplyChainStage.StoredInRetail, "Product not stored");
        require(_price > 0, "Price must be greater than 0");
        
        order.price = _price;
        _updateStage(order, SupplyChainStage.ListedForSale);
        
        emit OrderListedForSale(_traceId, msg.sender, _price, block.timestamp);
    }
    
    // Consumer purchases product
    function purchaseProduct(bytes32 _traceId) external payable {
        Order storage order = orders[_traceId];
        require(order.exists, "Order does not exist");
        require(order.currentStage == SupplyChainStage.ListedForSale, "Product not for sale");
        require(msg.value >= order.price, "Insufficient payment");
        require(order.consumer == address(0), "Product already purchased");
        
        order.consumer = msg.sender;
        
        // Transfer payment to retailer
        payable(order.retailer).transfer(order.price);
        
        // Refund excess payment if any
        if (msg.value > order.price) {
            payable(msg.sender).transfer(msg.value - order.price);
        }
        
        _updateStage(order, SupplyChainStage.Purchased);
        
        // Update retailer stats
        retailers[order.retailer].totalProductsSold++;
        
        emit OrderPurchased(_traceId, msg.sender, order.price, block.timestamp);
    }
    
    // Mark order as delivered
    function deliverProduct(bytes32 _traceId) external {
        Order storage order = orders[_traceId];
        require(order.exists, "Order does not exist");
        require(order.currentStage == SupplyChainStage.Purchased, "Product not purchased");
        require(msg.sender == order.consumer || msg.sender == order.retailer, "Only consumer or retailer can mark delivered");
        
        _updateStage(order, SupplyChainStage.Delivered);
        
        // Update farmer stats
        farmers[order.farmer].totalDelivered++;
        
        emit OrderDelivered(_traceId, order.consumer, block.timestamp);
    }
    
    // Complete order (final stage)
    function completeOrder(bytes32 _traceId) external onlyFarmer(_traceId) {
        Order storage order = orders[_traceId];
        require(order.currentStage == SupplyChainStage.Delivered, "Order not delivered");
        
        _updateStage(order, SupplyChainStage.Completed);
    }
    
    // ============================
    // HELPER FUNCTIONS
    // ============================
    
    function _updateStage(Order storage order, SupplyChainStage newStage) private {
        // Add to stage history
        string[] memory newHistory = new string[](order.stageHistory.length + 1);
        for (uint i = 0; i < order.stageHistory.length; i++) {
            newHistory[i] = order.stageHistory[i];
        }
        newHistory[order.stageHistory.length] = _getStageName(newStage);
        order.stageHistory = newHistory;
        
        uint256[] memory newTimestamps = new uint256[](order.stageTimestamps.length + 1);
        for (uint i = 0; i < order.stageTimestamps.length; i++) {
            newTimestamps[i] = order.stageTimestamps[i];
        }
        newTimestamps[order.stageTimestamps.length] = block.timestamp;
        order.stageTimestamps = newTimestamps;
        
        order.currentStage = newStage;
        
        emit StageUpdated(order.traceId, newStage, block.timestamp);
    }
    
    function _getStageName(SupplyChainStage stage) private pure returns (string memory) {
        if (stage == SupplyChainStage.Harvested) return "Harvested";
        if (stage == SupplyChainStage.Packaged) return "Packaged";
        if (stage == SupplyChainStage.InTransitToRetailer) return "In Transit to Retailer";
        if (stage == SupplyChainStage.ReceivedByRetailer) return "Received by Retailer";
        if (stage == SupplyChainStage.StoredInRetail) return "Stored in Retail";
        if (stage == SupplyChainStage.ListedForSale) return "Listed for Sale";
        if (stage == SupplyChainStage.Purchased) return "Purchased";
        if (stage == SupplyChainStage.Delivered) return "Delivered";
        return "Completed";
    }
    
    // ============================
    // GETTER FUNCTIONS
    // ============================
    
    // Get full order details
    function getOrder(bytes32 _traceId) external view returns (
        bytes32 traceId,
        address farmer,
        address retailer,
        address consumer,
        string memory productName,
        uint256 quantity,
        uint256 timestamp,
        uint256 price,
        SupplyChainStage currentStage,
        string[] memory stageHistory,
        uint256[] memory stageTimestamps,
        string memory metadata
    ) {
        require(orders[_traceId].exists, "Order does not exist");
        Order storage order = orders[_traceId];
        
        return (
            order.traceId,
            order.farmer,
            order.retailer,
            order.consumer,
            order.productName,
            order.quantity,
            order.timestamp,
            order.price,
            order.currentStage,
            order.stageHistory,
            order.stageTimestamps,
            order.metadata
        );
    }
    
    // Get stage name string
    function getCurrentStageName(bytes32 _traceId) external view returns (string memory) {
        require(orders[_traceId].exists, "Order does not exist");
        return _getStageName(orders[_traceId].currentStage);
    }
    
    // Get stage count
    function getStageCount(bytes32 _traceId) external view returns (uint256) {
        require(orders[_traceId].exists, "Order does not exist");
        return orders[_traceId].stageHistory.length;
    }
    
    // Get specific stage by index
    function getStageByIndex(bytes32 _traceId, uint256 _index) external view returns (string memory, uint256) {
        require(orders[_traceId].exists, "Order does not exist");
        require(_index < orders[_traceId].stageHistory.length, "Index out of bounds");
        
        return (
            orders[_traceId].stageHistory[_index],
            orders[_traceId].stageTimestamps[_index]
        );
    }
    
    // Get farmer details
    function getFarmer(address _farmer) external view returns (
        string memory name,
        string memory aadhaarHash,
        bool isVerified,
        uint256 registeredAt,
        uint256 totalProducts,
        uint256 totalDelivered
    ) {
        require(farmers[_farmer].exists, "Farmer not found");
        Farmer storage farmer = farmers[_farmer];
        
        return (
            farmer.name,
            farmer.aadhaarHash,
            farmer.isVerified,
            farmer.registeredAt,
            farmer.totalProducts,
            farmer.totalDelivered
        );
    }
    
    // Get retailer details
    function getRetailer(address _retailer) external view returns (
        string memory name,
        string memory licenseNumber,
        string memory gstNumber,
        bool isVerified,
        uint256 registeredAt,
        uint256 totalProductsReceived,
        uint256 totalProductsSold,
        uint256 rating,
        uint256 totalRatings
    ) {
        require(retailers[_retailer].exists, "Retailer not found");
        Retailer storage retailer = retailers[_retailer];
        
        return (
            retailer.name,
            retailer.licenseNumber,
            retailer.gstNumber,
            retailer.isVerified,
            retailer.registeredAt,
            retailer.totalProductsReceived,
            retailer.totalProductsSold,
            retailer.rating,
            retailer.totalRatings
        );
    }
    
    // Get farmer's orders
    function getFarmerOrders(address _farmer) external view returns (bytes32[] memory) {
        require(farmers[_farmer].exists, "Farmer not found");
        return farmerOrders[_farmer];
    }
    
    // Get retailer's orders
    function getRetailerOrders(address _retailer) external view returns (bytes32[] memory) {
        require(retailers[_retailer].exists, "Retailer not found");
        return retailerOrders[_retailer];
    }
    
    // Check if an order is ready for purchase
    function isAvailableForPurchase(bytes32 _traceId) external view returns (bool) {
        require(orders[_traceId].exists, "Order does not exist");
        return orders[_traceId].currentStage == SupplyChainStage.ListedForSale;
    }
    
    // Get order status as string
    function getOrderStatus(bytes32 _traceId) external view returns (string memory) {
        require(orders[_traceId].exists, "Order does not exist");
        return _getStageName(orders[_traceId].currentStage);
    }
}