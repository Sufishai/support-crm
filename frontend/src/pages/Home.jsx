import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import TicketCard from "../components/TicketCard";
import Loading from "../components/Loading";

const API_URL = "http://127.0.0.1:8000";

function Home() {
  const [searchParams] = useSearchParams();

  const statusFromUrl = searchParams.get("status");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(
    statusFromUrl || ""
  );

  useEffect(() => {
    setStatus(statusFromUrl || "");
  }, [statusFromUrl]);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (status) {
        params.append("status", status);
      }

      const response = await fetch(
        `${API_URL}/api/tickets?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();

      setTickets(data);
    } catch (error) {
      console.error(
        "Error fetching tickets:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch tickets 
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  const openCount = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const progressCount = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const closedCount = tickets.filter(
    (ticket) => ticket.status === "Closed"
  ).length;

  return (
    <div className="home-page">

      <div className="page-header">
        <div>
          <h1>Support Tickets</h1>

          <p>
            Manage and track customer support requests
          </p>
        </div>
      </div>

      {/* Statistics */}

      <div className="stats-grid">

        <div className="stat-card">
          <span className="stat-label">
            Total Tickets
          </span>

          <span className="stat-value">
            {tickets.length}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Open
          </span>

          <span className="stat-value">
            {openCount}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            In Progress
          </span>

          <span className="stat-value">
            {progressCount}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Closed
          </span>

          <span className="stat-value">
            {closedCount}
          </span>
        </div>

      </div>

      {/* Filters */}

      <div className="filters">

        <input
          type="text"
          placeholder="Search by name, ID, email or description..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="search-input"
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="status-filter"
        >
          <option value="">
            All Statuses
          </option>

          <option value="Open">
            Open
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Closed">
            Closed
          </option>
        </select>

      </div>

      {/* Tickets */}

      {loading ? (
        <Loading />
      ) : tickets.length === 0 ? (

        <div className="empty-state">

          <h3>
            No tickets found
          </h3>

          <p>
            {search || status
              ? "Try changing your search or filter."
              : "Create your first support ticket to get started."}
          </p>

        </div>

      ) : (

        <div className="tickets-grid">

          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.ticket_id}
              ticket={ticket}
            />
          ))}

        </div>

      )}

    </div>
  );
}

export default Home;
