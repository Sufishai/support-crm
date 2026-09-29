import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [automationLogs, setAutomationLogs] = useState([]);
  const fetchTickets = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/tickets`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetch("http://127.0.0.1:8000/api/automation-logs")
  .then((response) => response.json())
  .then((data) => setAutomationLogs(data))
  .catch((error) =>
    console.error("Error fetching automation logs:", error)
  );
  }, []);

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const closedTickets = tickets.filter(
    (ticket) => ticket.status === "Closed"
  ).length;

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <div>
          <h1>Support Dashboard</h1>
          <p>
            Overview of your customer support tickets
          </p>
        </div>
      </div>

      {/* Statistics */}

      <div className="stats-grid">

        <div className="stat-card">
          <span className="stat-label">
            Total Tickets
          </span>

          <strong className="stat-number">
            {totalTickets}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Open
          </span>

          <strong className="stat-number">
            {openTickets}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            In Progress
          </span>

          <strong className="stat-number">
            {inProgressTickets}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Closed
          </span>

          <strong className="stat-number">
            {closedTickets}
          </strong>
        </div>

      </div>

      {/* Ticket Distribution */}

      <div className="dashboard-card">

        <h2>Ticket Distribution</h2>

        <div className="distribution">

          <div className="distribution-row">
            <span>Open</span>

            <div className="progress-container">
              <div
                className="progress-bar"
                style={{
                  width: totalTickets
                    ? `${(openTickets / totalTickets) * 100}%`
                    : "0%",
                }}
              />
            </div>

            <strong>{openTickets}</strong>
          </div>

          <div className="distribution-row">
            <span>In Progress</span>

            <div className="progress-container">
              <div
                className="progress-bar"
                style={{
                  width: totalTickets
                    ? `${(inProgressTickets / totalTickets) * 100}%`
                    : "0%",
                }}
              />
            </div>

            <strong>{inProgressTickets}</strong>
          </div>

          <div className="distribution-row">
            <span>Closed</span>

            <div className="progress-container">
              <div
                className="progress-bar"
                style={{
                  width: totalTickets
                    ? `${(closedTickets / totalTickets) * 100}%`
                    : "0%",
                }}
              />
            </div>

            <strong>{closedTickets}</strong>
          </div>

        </div>

      </div>

{/* Quick Actions */}

<div className="dashboard-card">

  <h2>Quick Actions</h2>

  <div className="quick-actions">

    <Link
      to="/create-ticket"
      className="quick-action"
    >
      <strong>＋ Create Ticket</strong>
      <span>Create a new support ticket</span>
    </Link>

    <Link
      to="/?status=Open"
      className="quick-action"
    >
      <strong> Open Tickets</strong>
      <span>View all open tickets</span>
    </Link>

    <Link
      to="/?status=In%20Progress"
      className="quick-action"
    >
      <strong> In Progress</strong>
      <span>View tickets being handled</span>
    </Link>

  </div>

</div>
{/* Automation Activity */}
<div className="automation-section">
  <div className="section-header">
    <div>
      <h2>Automation Activity</h2>
      <p>Recent automated events triggered by the CRM</p>
    </div>
  </div>

  {automationLogs.length === 0 ? (
    <div className="empty-state">
      <p>No automation activity yet.</p>
    </div>
  ) : (
    <div className="automation-list">
      {automationLogs.map((log) => (
        <div
          className="automation-item"
          key={log.id}
        >
          <div className="automation-icon">
            ✓
          </div>

          <div className="automation-content">
            <strong>
              {log.event}
            </strong>

            <span>
              {log.message}
            </span>

            <small>
              Ticket: {log.ticket_id}
            </small>
          </div>

          <div className="automation-time">
            {new Date(log.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )}
</div>


      {/* Recent Tickets */}

      <div className="dashboard-card">

        <h2>Recent Tickets</h2>

        {tickets.length === 0 ? (
          <p>No tickets available.</p>
        ) : (
          <div className="recent-tickets">

            {tickets.slice(0, 5).map((ticket) => (
              <div
                className="recent-ticket"
                key={ticket.ticket_id}
              >

                <div>
                  <strong>
                    {ticket.ticket_id}
                  </strong>

                  <span>
                    {ticket.subject}
                  </span>
                </div>

                <span className="dashboard-status">
                  {ticket.status}
                </span>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;
