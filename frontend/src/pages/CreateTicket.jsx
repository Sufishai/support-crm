import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function CreateTicket() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    subject: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create ticket"
        );
      }

      navigate(`/tickets/${data.ticket_id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-header">
        <h1>Create New Ticket</h1>
        <p>
          Add a new customer support request.
        </p>
      </div>

      <form
        className="ticket-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label>Customer Name</label>

          <input
            type="text"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
          />
        </div>

        <div className="form-group">
          <label>Customer Email</label>

          <input
            type="email"
            name="customer_email"
            value={form.customer_email}
            onChange={handleChange}
            placeholder="customer@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Issue Title</label>

          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Briefly describe the issue"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Provide details about the issue..."
            rows="6"
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;