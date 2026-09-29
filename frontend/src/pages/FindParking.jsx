import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { parkingService } from '../services/api';
import socket from '../services/socket';
import ParkingCard from '../components/ParkingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSearch, FiMap } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FindParking = () => {
  const location = useLocation();
  const [parkings, setParkings] = useState([]); // MongoDB parkings
  const [searchInput, setSearchInput] = useState(location.state?.initialSearch || '');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load of SmartPark managed locations
  const fetchParkings = async (query = '') => {
    try {
      const response = await parkingService.getAllParkings(query);
      setParkings(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings('');

    // Listen for real-time updates
    socket.on('parking_updated', (data) => {
      setParkings(prevParkings => 
        prevParkings.map(p => 
          p._id === data.parkingId ? { ...p, availableSlots: data.availableSlots, totalSlots: data.totalSlots } : p
        )
      );
    });

    return () => {
      socket.off('parking_updated');
    };
  }, []);

  useEffect(() => {
    if (location.state?.initialSearch) {
      fetchParkings(location.state.initialSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchParkings(searchInput);
  };

  return (
    <div className="find-parking-page">
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>Find Parking</h1>
        
        <form onSubmit={handleSearch} className="search-bar-container" style={{ margin: '0 auto', maxWidth: '600px', display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search parking by location or city (e.g. Chennai)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ borderRadius: '9999px', padding: '0 1.5rem' }}>
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="error-text" style={{ textAlign: 'center', color: 'red' }}>Failed to load parking spots: {error}</p>
      ) : (
        <>
          {/* Map View & List View Split */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {/* Map Column */}
            <div style={{ flex: '1 1 500px', height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              <MapContainer center={[12.9716, 77.5946]} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {parkings.map(parking => (
                  parking.coordinates && parking.coordinates.lat ? (
                    <Marker 
                      key={parking._id} 
                      position={[parking.coordinates.lat, parking.coordinates.lng]}
                    >
                      <Popup>
                        <strong>{parking.name}</strong><br/>
                        Slots: {parking.availableSlots} / {parking.totalSlots}<br/>
                        {parking.hasEVCharging && <span style={{ color: 'var(--primary)' }}>⚡ EV Charging Available</span>}
                      </Popup>
                    </Marker>
                  ) : null
                ))}
              </MapContainer>
            </div>

            {/* List Column */}
            <div style={{ flex: '1 1 400px' }}>
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                SmartPark Locations
              </h2>
              <div className="parking-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {parkings.map(parking => (
                  <ParkingCard key={parking._id} parking={parking} />
                ))}
              </div>
              {parkings.length === 0 && (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <p>No SmartPark managed locations found matching "{searchInput}".</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FindParking;
