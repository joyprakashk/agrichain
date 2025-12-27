import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css"; // Ensure this is imported in index.html or globally if install fails
import io from "socket.io-client";
import { Truck, MapPin, Package } from "lucide-react";

// Fix Leaflet marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom Icons
const truckIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/819/819873.png", // Example truck icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

const sourceIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const destIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const socket = io("http://localhost:8080"); // Connect to backend

const RoutingMachine = ({ source, dest }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !source || !dest) return;

        // Importing dynamically to avoid SSR issues if any, but mainly to handle 'L' global
        import("leaflet-routing-machine").then(() => {
            const routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(source.lat, source.lng),
                    L.latLng(dest.lat, dest.lng)
                ],
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                lineOptions: {
                    styles: [{ color: "#6FA1EC", weight: 4 }]
                },
                createMarker: function () { return null; } // Hide default markers, we use custom ones
            }).addTo(map);

            return () => map.removeControl(routingControl);
        }).catch(err => console.warn("Leaflet Routing Machine not loaded", err));
    }, [map, source, dest]);

    return null;
};

const TrackingPage = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const { orderData } = location.state || {}; // Passed from previous page

    // Default coordinates (India center)
    const [source, setSource] = useState(orderData?.source || { lat: 12.9716, lng: 77.5946 }); // Bengaluru
    const [destination, setDestination] = useState(orderData?.destination || { lat: 13.0827, lng: 80.2707 }); // Chennai
    const [currentLocation, setCurrentLocation] = useState(source);
    const [status, setStatus] = useState("Preparing");

    useEffect(() => {
        // Join order room
        socket.emit("join_tracking", orderId);

        // Listen for updates
        socket.on("location_update", (data) => {
            console.log("📍 Location update received:", data);
            setCurrentLocation(data.position);
            setStatus(data.status || "In Transit");
        });

        return () => {
            socket.off("location_update");
        };
    }, [orderId]);

    // Simulation Logic (For Demo)
    const [isSimulating, setIsSimulating] = useState(false);

    const startSimulation = () => {
        setIsSimulating(true);
        socket.emit("start_simulation", { orderId, source, destination });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-md p-4 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                            <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Live Shipment Tracking</h1>
                            <p className="text-sm text-gray-500">Order #{orderId}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-50 dark:bg-blue-900 px-4 py-2 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase tracking-wider">Status</p>
                            <p className="font-semibold text-blue-800 dark:text-blue-100">{status}</p>
                        </div>
                        {/* Demo Button */}
                        <button
                            onClick={startSimulation}
                            disabled={isSimulating}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                            {isSimulating ? "Simulating..." : "Start Demo Simulation"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-grow relative z-0">
                <MapContainer
                    center={[source.lat, source.lng]}
                    zoom={7}
                    scrollWheelZoom={true}
                    className="h-full w-full absolute inset-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={source} icon={sourceIcon}>
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold">Farmer Location</p>
                                <p className="text-xs text-gray-500">Source</p>
                            </div>
                        </Popup>
                    </Marker>

                    <Marker position={destination} icon={destIcon}>
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold">Consumer Location</p>
                                <p className="text-xs text-gray-500">Destination</p>
                            </div>
                        </Popup>
                    </Marker>

                    <Marker position={currentLocation} icon={truckIcon}>
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold">Live Shipment</p>
                                <p className="text-xs text-gray-500">Updated just now</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Route Rendering */}
                    <RoutingMachine source={source} dest={destination} />

                </MapContainer>
            </div>

            {/* Legend / Info Panel */}
            <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="container mx-auto flex justify-center space-x-8 text-sm">
                    <div className="flex items-center">
                        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" className="w-4 h-6 mr-2" alt="Source" />
                        <span className="text-gray-600 dark:text-gray-300">Source (Farmer)</span>
                    </div>
                    <div className="flex items-center">
                        <img src="https://cdnt-icons-png.flaticon.com/512/819/819873.png" className="w-6 h-6 mr-2" alt="Truck" />
                        <span className="text-gray-600 dark:text-gray-300">Current Location</span>
                    </div>
                    <div className="flex items-center">
                        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" className="w-4 h-6 mr-2" alt="Dest" />
                        <span className="text-gray-600 dark:text-gray-300">Destination (Consumer)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackingPage;
