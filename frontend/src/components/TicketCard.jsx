import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function TicketCard({ ticket }) {
  const date = new Date(ticket.created_at).toLocaleDateString();

  return (
    <Link
      to={`/tickets/${ticket.ticket_id}`}
      className="ticket-card"
    >
      <div className="ticket-card-header">
        <span className="ticket-id">
          {ticket.ticket_id}
        </span>

        <StatusBadge status={ticket.status} />
      </div>

      <h3>{ticket.subject}</h3>

      <p className="customer-name">
        {ticket.customer_name}
      </p>

      <div className="ticket-card-footer">
        <span>{date}</span>

        <span className="view-ticket">
          View →
        </span>
      </div>
    </Link>
  );
}

export default TicketCard;