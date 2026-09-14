import { Link } from 'react-router-dom';
import AvailabilityBadge from './AvailabilityBadge';
import { FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';
import './ParkingCard.css';

const ParkingCard = ({ parking, isOSM = false }) => {
  return (
    <div className={`card parking-card ${isOSM ? 'osm-card' : ''}`}>
      <div className="parking-card-header">
        <h3>{parking.name}</h3>
        {!isOSM ? (
          <AvailabilityBadge available={parking.availableSlots} total={parking.totalSlots} />
        ) : (
          <span className="osm-badge">Availability data unavailable</span>
        )}
      </div>
      
      <p className="location-text">
        <FiMapPin className="icon" /> {isOSM ? parking.address : parking.location}
      </p>
      
      {!isOSM && (
        <div className="parking-card-details">
          <div className="detail-item">
            <FiDollarSign className="icon text-primary" />
            <span><strong>${parking.pricePerHour}</strong> / hr</span>
          </div>
          <div className="detail-item">
            <FiClock className="icon text-primary" />
            <span>{parking.openingTime} - {parking.closingTime}</span>
          </div>
        </div>
      )}

      {isOSM && (
        <div className="parking-card-details">
          <div className="detail-item">
            <FiMapPin className="icon text-primary" />
            <span>Lat: {parking.latitude?.toFixed(4)}, Lon: {parking.longitude?.toFixed(4)}</span>
          </div>
        </div>
      )}
      
      {!isOSM && (
        <Link to={`/parking/${parking._id}`} className="btn btn-primary card-btn">
          View Details
        </Link>
      )}
      {isOSM && (
        <button disabled className="btn btn-secondary card-btn">
          External Location
        </button>
      )}
    </div>
  );
};

export default ParkingCard;
