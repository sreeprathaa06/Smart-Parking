import './AvailabilityBadge.css';

const AvailabilityBadge = ({ available, total }) => {
  const isFull = available === 0;
  
  return (
    <div className={`availability-badge ${isFull ? 'full' : 'available'}`}>
      <span className="dot"></span>
      {isFull ? 'Full' : `${available} Left`}
    </div>
  );
};

export default AvailabilityBadge;
