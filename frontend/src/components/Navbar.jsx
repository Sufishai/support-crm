import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          SupportCRM
        </Link>

        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>

          <Link to="/create-ticket" className="new-ticket-button">
            + New Ticket
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;