import { FiSearch } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search-bar-container">
      <FiSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search parking by location or name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;
