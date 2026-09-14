import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} SmartPark. All rights reserved.</p>
        <p className="footer-subtext">Find a Parking Spot Before You Reach.</p>
      </div>
    </footer>
  );
};

export default Footer;
