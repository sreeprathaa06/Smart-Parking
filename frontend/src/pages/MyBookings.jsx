import { useState, useEffect, useContext } from 'react';
import { bookingService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiCalendar, FiMapPin, FiClock, FiTrash2 } from 'react-icons/fi';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await bookingService.cancelBooking(id);
      // Refresh bookings
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="my-bookings-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Bookings</h1>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {bookings.length === 0 && !error ? (
        <div className="empty-state card">
          <FiCalendar className="empty-state-icon" />
          <h3>No bookings yet</h3>
          <p>You haven't made any parking reservations. Start exploring available spots!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map(booking => (
            <div key={booking._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', padding: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{booking.parking?.name || 'Unknown Parking'}</h3>
                  <span style={{ fontSize: '0.85rem', padding: '0.15rem 0.5rem', backgroundColor: 'var(--bg-light)', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {booking.bookingId || 'SP-N/A'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiMapPin /> {booking.parking?.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiCalendar /> {new Date(booking.bookingDate).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiClock /> {booking.startTime} - {booking.endTime}
                  </span>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backgroundColor: booking.status === 'confirmed' ? '#d1fae5' : booking.status === 'cancelled' ? '#fee2e2' : 'var(--bg-light)',
                    color: booking.status === 'confirmed' ? '#065f46' : booking.status === 'cancelled' ? '#991b1b' : 'var(--text-main)',
                    textTransform: 'capitalize'
                  }}>
                    {booking.status}
                  </span>
                </div>
              </div>
              
              {booking.status !== 'cancelled' && (
                <button 
                  onClick={() => handleCancel(booking._id)} 
                  className="btn btn-danger"
                >
                  <FiTrash2 /> Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
