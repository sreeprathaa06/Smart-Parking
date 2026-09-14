import { useState, useEffect } from 'react';
import { bookingService, parkingService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import socket from '../services/socket';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParking, setEditingParking] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    totalSlots: '',
    pricePerHour: '',
    openingTime: '00:00',
    closingTime: '23:59',
    status: 'active'
  });

  useEffect(() => {
    fetchData();

    // Listen for real-time updates
    socket.on('parking_updated', (data) => {
      setParkings(prevParkings => 
        prevParkings.map(p => 
          p._id === data.parkingId ? { ...p, availableSlots: data.availableSlots, totalSlots: data.totalSlots, name: data.name } : p
        )
      );
    });

    return () => {
      socket.off('parking_updated');
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, parkingsRes] = await Promise.all([
        bookingService.getAllBookings(),
        parkingService.getAllParkings()
      ]);
      setBookings(bookingsRes.data.data);
      setParkings(parkingsRes.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Derived Statistics
  const totalAreas = parkings.length;
  const totalSlots = parkings.reduce((sum, p) => sum + p.totalSlots, 0);
  const availableSlots = parkings.reduce((sum, p) => sum + p.availableSlots, 0);
  const occupiedSlots = totalSlots - availableSlots;
  const totalBookings = bookings.length;

  const handleOpenModal = (parking = null) => {
    if (parking) {
      setEditingParking(parking);
      setFormData({
        name: parking.name,
        location: parking.location,
        totalSlots: parking.totalSlots,
        pricePerHour: parking.pricePerHour,
        openingTime: parking.openingTime,
        closingTime: parking.closingTime,
        status: parking.status
      });
    } else {
      setEditingParking(null);
      setFormData({
        name: '',
        location: '',
        totalSlots: '',
        pricePerHour: '',
        openingTime: '00:00',
        closingTime: '23:59',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingParking(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveParking = async (e) => {
    e.preventDefault();
    try {
      if (editingParking) {
        // Also update availableSlots if totalSlots changes (simple logic: reset or adjust)
        // For simplicity, we just pass the form data. Backend will handle it.
        await parkingService.updateParking(editingParking._id, formData);
      } else {
        await parkingService.createParking(formData);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save parking');
    }
  };

  const handleDeleteParking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parking area?')) return;
    try {
      await parkingService.deleteParking(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete parking');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'parkings' ? 'active' : ''}`}
            onClick={() => setActiveTab('parkings')}
          >
            🅿️ Manage Parking
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            📋 All Bookings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {error && <div className="error-text">Error: {error}</div>}

        {activeTab === 'overview' && (
          <div className="tab-content">
            <h1>Dashboard Overview</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Areas</h3>
                <p className="stat-value">{totalAreas}</p>
              </div>
              <div className="stat-card">
                <h3>Total Slots</h3>
                <p className="stat-value">{totalSlots}</p>
              </div>
              <div className="stat-card">
                <h3>Available Slots</h3>
                <p className="stat-value" style={{color: 'var(--secondary)'}}>{availableSlots}</p>
              </div>
              <div className="stat-card">
                <h3>Occupied Slots</h3>
                <p className="stat-value" style={{color: 'var(--danger)'}}>{occupiedSlots}</p>
              </div>
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p className="stat-value">{totalBookings}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'parkings' && (
          <div className="tab-content">
            <div className="tab-header">
              <h1>Manage Parking Areas</h1>
              <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                + Add Parking Area
              </button>
            </div>
            
            <div className="card table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name / Location</th>
                    <th>Slots (Total/Avail)</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parkings.length === 0 ? (
                    <tr><td colSpan="5" className="text-center">No parking areas found.</td></tr>
                  ) : (
                    parkings.map(parking => (
                      <tr key={parking._id}>
                        <td>
                          <strong>{parking.name}</strong><br/>
                          <span className="text-muted">{parking.location}</span>
                        </td>
                        <td>{parking.totalSlots} / <strong style={{color: 'var(--secondary)'}}>{parking.availableSlots}</strong></td>
                        <td>${parking.pricePerHour}/hr</td>
                        <td style={{textTransform: 'capitalize'}}>{parking.status}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(parking)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteParking(parking._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="tab-content">
            <h1>All Bookings</h1>
            <div className="card table-container">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Parking</th>
                    <th>Date / Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan="4" className="text-center">No bookings found.</td></tr>
                  ) : (
                    bookings.map(booking => (
                      <tr key={booking._id}>
                        <td>
                          <strong>{booking.user?.name || 'Unknown'}</strong><br/>
                          <span className="text-muted">{booking.user?.email || 'N/A'}</span>
                        </td>
                        <td>
                          <strong>{booking.parking?.name || 'Unknown'}</strong><br/>
                          <span className="text-muted">{booking.parking?.location || 'N/A'}</span>
                        </td>
                        <td>
                          {new Date(booking.bookingDate).toLocaleDateString()}<br/>
                          <span className="text-muted">{booking.startTime} - {booking.endTime}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingParking ? 'Edit Parking Area' : 'Add Parking Area'}</h2>
            <form onSubmit={handleSaveParking}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleFormChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Slots</label>
                  <input type="number" name="totalSlots" value={formData.totalSlots} onChange={handleFormChange} required min="1" />
                </div>
                <div className="form-group">
                  <label>Price Per Hour ($)</label>
                  <input type="number" name="pricePerHour" value={formData.pricePerHour} onChange={handleFormChange} required min="0" step="0.01" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Opening Time</label>
                  <input type="time" name="openingTime" value={formData.openingTime} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Closing Time</label>
                  <input type="time" name="closingTime" value={formData.closingTime} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleFormChange}>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
