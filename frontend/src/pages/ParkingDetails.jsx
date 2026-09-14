import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { parkingService, bookingService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import socket from '../services/socket';
import LoadingSpinner from '../components/LoadingSpinner';
import AvailabilityBadge from '../components/AvailabilityBadge';
import { FiMapPin, FiClock, FiDollarSign, FiInfo } from 'react-icons/fi';
import './ParkingDetails.css';

const ParkingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const response = await parkingService.getParkingById(id);
        setParking(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchParking();

    // Listen for real-time updates
    socket.on('parking_updated', (data) => {
      setParking(prev => {
        if (prev && prev._id === data.parkingId) {
          return { ...prev, availableSlots: data.availableSlots, totalSlots: data.totalSlots, name: data.name };
        }
        return prev;
      });
    });

    return () => {
      socket.off('parking_updated');
    };
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    // Default to booking for today, from opening to closing time for simplicity
    const bookingData = {
      parkingId: id,
      bookingDate: new Date().toISOString(),
      startTime: parking.openingTime,
      endTime: parking.closingTime
    };

    try {
      const response = await bookingService.createBooking(bookingData);
      setConfirmedBooking(response.data.data);
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to book parking slot');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !parking) return <div className="error-text" style={{ textAlign: 'center', color: 'red' }}>{error || 'Parking not found'}</div>;

  if (confirmedBooking) {
    return (
      <div className="parking-details-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card details-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 style={{ marginBottom: '1.5rem', color: '#065f46' }}>Booking Confirmed</h1>
          
          <div style={{ textAlign: 'left', backgroundColor: 'var(--bg-light)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
            <p style={{ margin: '0.5rem 0' }}><strong>Parking:</strong> {parking.name}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Date:</strong> {new Date(confirmedBooking.bookingDate).toLocaleDateString()}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Time:</strong> {confirmedBooking.startTime} - {confirmedBooking.endTime}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Booking ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 'bold' }}>{confirmedBooking.bookingId}</span></p>
            <p style={{ margin: '0.5rem 0' }}><strong>Status:</strong> Confirmed</p>
          </div>
          
          <Link to="/my-bookings" className="btn btn-primary" style={{ display: 'inline-block', width: '100%', padding: '1rem' }}>
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const isFull = parking.availableSlots === 0;

  return (
    <div className="parking-details-page">
      <div className="card details-card">
        <div className="details-header">
          <h1>{parking.name}</h1>
          <AvailabilityBadge available={parking.availableSlots} total={parking.totalSlots} />
        </div>
        
        <p className="location">
          <FiMapPin className="text-primary" /> {parking.location}
        </p>
        
        <div className="description card bg-light">
          <p><FiInfo className="text-primary" /> {parking.description || 'No additional details provided for this location.'}</p>
        </div>
        
        <div className="info-grid">
          <div className="info-box">
            <h4>Price</h4>
            <p><FiDollarSign className="text-muted" /> {parking.pricePerHour} <span style={{fontSize:'0.875rem', fontWeight:'normal', color:'var(--text-muted)'}}>/ hour</span></p>
          </div>
          <div className="info-box">
            <h4>Operating Hours</h4>
            <p><FiClock className="text-muted" /> {parking.openingTime} - {parking.closingTime}</p>
          </div>
          <div className="info-box">
            <h4>Status</h4>
            <p style={{ textTransform: 'capitalize' }}>
              <span className={`status-badge ${parking.status === 'active' ? 'confirmed' : 'cancelled'}`}>{parking.status}</span>
            </p>
          </div>
        </div>

        {bookingError && <div className="error-text" style={{ marginTop: '1.5rem' }}>{bookingError}</div>}

        <div className="booking-action">
          <button 
            className="btn btn-primary" 
            onClick={handleBook} 
            disabled={isFull || bookingLoading}
            style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem' }}
          >
            {bookingLoading ? 'Processing...' : isFull ? 'Parking Full' : 'Confirm Booking'}
          </button>
          {!user && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>You must be logged in to book a spot.</p>}
        </div>
      </div>
    </div>
  );
};

export default ParkingDetails;
