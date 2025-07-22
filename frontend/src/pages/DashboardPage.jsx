import { use } from "react";
import { useState, useEffect, useCallback } from "react";

const API_URL = "http://5.223.65.178:3001";
// const API_URL = "http://localhost:3001"; // For local development

function DashboardPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(""); // '', 'pending', 'approved', 'rejected'

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    const url = filter
      ? `${API_URL}/api/testimonials?status=${filter}`
      : `${API_URL}/api/testimonials`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch testimonials");
      }
      const data = await response.json();
      setTestimonials(data);
      console.log("Testimonials fetched:", data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/testimonials/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTestimonials(); // Refresh testimonials after status change
    } catch (error) {
      console.error("Error updating testimonial status:", error);
    }
  };

  if (loading) {
    return <div>Loading testimonials...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Testimonial Dashboard</h2>
      // Dropdown Filter options
      <div className="filter-options">
        <label htmlFor="status-filter">Filter by status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="testimonial-list">
        {testimonials.map((t) => (
          <div key={t.id} className={`testimonial-card ${t.status}`}>
            <div className="card-header">
              <span>Submitted: {new Date(t.created_at).toLocaleString()}</span>
              <span className="status-badge">
                Status: {t.status.toUpperCase()}
              </span>
            </div>
            <div className="card-body">
              {t.answers.map((a, index) => (
                <div key={index} className="answer-group">
                  <strong>{a.question}</strong>
                  <p>{a.answer}</p>
                </div>
              ))}
              {t.media_url && (
                <div className="media-group">
                  <strong>Media:</strong>
                  <a
                    href={t.media_url}
                    target="_blank"
                    rel="noopener noreferer"
                  >
                    View File
                  </a>
                </div>
              )}
            </div>
            <div className="card-actions">
              {t.status === "pending" && (
                <button onClick={() => handleStatusChange(t.id, "approved")}>
                  Approve
                </button>
              )}
              {t.status !== "rejected" && (
                <button onClick={() => handleStatusChange(t.id, "rejected")}>
                  Reject
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
