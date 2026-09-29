import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

const API_URL = "http://127.0.0.1:8000";

function TicketDetails() {
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  //AI reply state
  const [replyLoading, setReplyLoading] = useState(false);
  const [aiReply, setAiReply] = useState("");
  const [replyError, setReplyError] = useState("");

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiError, setAiError] = useState("");

  const fetchTicket = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}`
      );

      if (!response.ok) {
        throw new Error("Ticket not found");
      }

      const data = await response.json();

      setTicket(data);
      setStatus(data.status);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

 //update tkt
  const handleUpdate = async () => {
    if (!status && !note) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
            notes: note || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update ticket"
        );
      }

      setNote("");

      await fetchTicket();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

const handleGenerateReply = async () => {
  try {
    setReplyLoading(true);
    setReplyError("");
    setAiReply("");

    const response = await fetch(
      `${API_URL}/api/tickets/${ticketId}/reply`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to generate AI reply"
      );
    }

    setAiReply(data.suggested_reply);
  } catch (error) {
    setReplyError(error.message);
  } finally {
    setReplyLoading(false);
  }
};


  // AI analysis

  const handleAIAnalysis = async () => {
    try {
      setAiLoading(true);
      setAiError("");
      setAiAnalysis(null);

      const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}/analyze`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "AI analysis failed"
        );
      }

      setAiAnalysis(data.analysis);
    } catch (error) {
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !ticket) {
    return (
      <div className="empty-state">
        <h2>Ticket not found</h2>
        <p>{error}</p>

        <Link to="/">
          ← Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="details-page">


      <Link to="/" className="back-link">
        ← Back to tickets
      </Link>



      <div className="details-header">

        <div>

          <span className="ticket-id">
            {ticket.ticket_id}
          </span>

          <h1>{ticket.subject}</h1>

          <p>
            Created{" "}
            {new Date(
              ticket.created_at
            ).toLocaleString()}
          </p>

        </div>

        <StatusBadge status={ticket.status} />

      </div>


      <div className="details-grid">

  {/* ISSUE DETAILS */}

  <div className="detail-card">

    <h2>Issue Details</h2>

    <div className="description">
      <h3>Description</h3>

      <p>
        {ticket.description}
      </p>
    </div>

  </div>


  {/* CUSTOMER + TICKET UPDATE */}

  <div className="detail-card">

    <h2>Customer Information</h2>

    <div className="customer-info">

      <strong>
        {ticket.customer_name}
      </strong>

      <span>
        {ticket.customer_email}
      </span>

    </div>

    <h2 style={{ marginTop: "24px" }}>
      Update Ticket
    </h2>

    <div className="form-group">

      <label>Status</label>

      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value)
        }
      >
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

    <div className="form-group">

      <label>Add Note</label>

      <textarea
        value={note}
        onChange={(e) =>
          setNote(e.target.value)
        }
        placeholder="Add an internal note..."
        rows="5"
      />

    </div>

    {error && (
      <div className="error-message">
        {error}
      </div>
    )}

    <button
      className="primary-button full-width"
      onClick={handleUpdate}
      disabled={saving}
    >
      {saving
        ? "Saving..."
        : "Save Changes"}
    </button>

  </div>

</div>


      {/*ANALYSIS*/}

      <div className="detail-card ai-section">

        <div className="ai-header">

          <div>
            <h2>🤖 AI Ticket Analysis</h2>

            <p>
              Let AI analyze this ticket and recommend
              the next action for the support agent.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={handleAIAnalysis}
            disabled={aiLoading}
          >

            {aiLoading
              ? "Analyzing..."
              : "Analyze with AI"}

          </button>

        </div>


        {/*error*/}

        {aiError && (
          <div className="error-message">
            {aiError}
          </div>
        )}


        {/* RESULTS */}

        {aiAnalysis && (

          <div className="ai-results">

            {/* Top info */}

            <div className="ai-summary-grid">

              <div className="ai-result-item">

                <span className="ai-label">
                  Category
                </span>

                <strong>
                  {aiAnalysis.category}
                </strong>

              </div>


              <div className="ai-result-item">

                <span className="ai-label">
                  Priority
                </span>

                <strong>
                  {aiAnalysis.priority}
                </strong>

              </div>


              <div className="ai-result-item">

                <span className="ai-label">
                  Sentiment
                </span>

                <strong>
                  {aiAnalysis.sentiment}
                </strong>

              </div>

            </div>


            {/* Summary */}

            <div className="ai-content">

              <h3>
                AI Summary
              </h3>

              <p>
                {aiAnalysis.summary}
              </p>

            </div>


            {/* Recommended action */}

            <div className="ai-content">

              <h3>
                Recommended Action
              </h3>

              <p>
                {aiAnalysis.recommended_action}
              </p>

            </div>

          </div>

        )}

      </div>


      {/* NOTES */}

      <div className="detail-card notes-section">

        <h2>
          Notes ({ticket.notes?.length || 0})
        </h2>

        {ticket.notes?.length === 0 ? (

          <p className="no-notes">
            No notes added yet.
          </p>

        ) : (

          <div className="notes-list">

            {ticket.notes.map((item) => (

              <div
                className="note"
                key={item.id}
              >

                <p>
                  {item.note_text}
                </p>

                <span>
                  {new Date(
                    item.created_at
                  ).toLocaleString()}
                </span>

              </div>

            ))}

          </div>

        )}

      </div>
{/* AI REPLY */}
<div className="detail-card ai-reply-section">

  <div className="ai-header">
    <div>
      <h2>🤖 AI Suggested Reply</h2>
      <p>
        Generate a professional customer response using AI.
      </p>
    </div>

    <button
      className="primary-button"
      onClick={handleGenerateReply}
      disabled={replyLoading}
    >
      {replyLoading
        ? "Generating..."
        : "Generate AI Reply"}
    </button>
  </div>

  {replyError && (
    <div className="error-message">
      {replyError}
    </div>
  )}

  {aiReply && (
    <div className="ai-reply-result">

      <textarea
        value={aiReply}
        onChange={(e) =>
          setAiReply(e.target.value)
        }
        rows="7"
      />

      <button
        className="secondary-button"
        onClick={() =>
          navigator.clipboard.writeText(aiReply)
        }
      >
        📋 Copy Reply
      </button>

    </div>
  )}

</div>

    </div>
  );
}

export default TicketDetails;
