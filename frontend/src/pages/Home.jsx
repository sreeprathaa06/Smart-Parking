import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { parkingService } from '../services/api';
import socket from '../services/socket';
import ParkingCard from '../components/ParkingCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSearch, FiCheckCircle, FiMapPin } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [parkings, setParkings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const response = await parkingService.getAllParkings();
        setParkings(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchParkings();

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

  const filteredParkings = parkings.filter(p => 
    p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find a Parking Spot Before You Reach.</h1>
          <p>SmartPark makes finding and booking parking spots seamless and stress-free. Reserve your space in seconds.</p>
          <form className="hero-search" onSubmit={(e) => {
            e.preventDefault();
            if(searchTerm.trim()) navigate('/parking', { state: { initialSearch: searchTerm } });
          }} style={{ display: 'flex', gap: '0.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            <div style={{ flex: 1 }}>
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '9999px', padding: '0 1.5rem' }}>
              Search OSM
            </button>
          </form>
          <Link to="/parking" className="btn btn-primary cta-btn">
            View All Parking Locations
          </Link>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How SmartPark Works</h2>
        <div className="steps">
          <div className="step-card card">
            <div className="step-icon"><FiSearch /></div>
            <h3>1. Search</h3>
            <p>Find available parking locations near your destination.</p>
          </div>
          <div className="step-card card">
            <div className="step-icon"><FiCheckCircle /></div>
            <h3>2. Book</h3>
            <p>Select a spot and book it instantly from your device.</p>
          </div>
          <div className="step-card card">
            <div className="step-icon"><FiMapPin /></div>
            <h3>3. Park</h3>
            <p>Arrive and park stress-free with your guaranteed spot.</p>
          </div>
        </div>
      </section>

      <section className="featured-parking">
        <h2>Available Parking Locations</h2>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="error-text">Failed to load parking spots: {error}</div>
        ) : (
          <div className="parking-grid">
            {filteredParkings.slice(0, 6).map(parking => (
              <ParkingCard key={parking._id} parking={parking} />
            ))}
          </div>
        )}
        {filteredParkings.length === 0 && !loading && !error && (
          <div className="empty-state">
            <FiSearch className="empty-state-icon" />
            <h3>No parking spots found</h3>
            <p>We couldn't find any locations matching your search.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
