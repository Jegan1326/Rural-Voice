import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const IssueMap = ({ issues }) => {
    const navigate = useNavigate();

    // Default center (India Approx) or average of issues
    const defaultCenter = [20.5937, 78.9629];

    // Calculate center from issues if available
    const center = issues.length > 0 && issues[0].location
        ? [issues[0].location.latitude, issues[0].location.longitude]
        : defaultCenter;

    return (
        <div className="h-96 w-full rounded-lg shadow-lg overflow-hidden z-0">
            <MapContainer center={center} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {issues.map(issue => (
                    issue.location && (
                        <Marker
                            key={issue._id}
                            position={[issue.location.latitude, issue.location.longitude]}
                        >
                            <Popup>
                                <div className="text-center">
                                    <h3 className="font-bold text-sm">{issue.title}</h3>
                                    <p className="text-xs text-gray-600">{issue.category}</p>
                                    <span className={`text-xs px-1 rounded ${issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {issue.status}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default IssueMap;
