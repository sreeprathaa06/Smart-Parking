import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { parkingService } from '../services/api';
import socket from '../services/socket';
import ParkingCard from '../components/ParkingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSearch, FiMap } from 'react-icons/fi';

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
          {/* SmartPark Managed Locations */}
          <div>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              SmartPark Locations
            </h2>
            <div className="parking-grid">
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
        </>
      )}
    </div>
  );
};

export default FindParking;
