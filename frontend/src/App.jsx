import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://5.223.65.178:3001";
// const API_URL = "http://localhost:3001"; // For local development

function App() {
  // State for questions we fetch from the API
  const [template, setTemplate] = useState(null);
  // State for user's answers
  const [answers, setAnswers] = useState({});
  // State for loading and submission status
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`${API_URL}/api/templates/1`); // Hardcoded template ID for simplicity
        const data = await response.json();
        setTemplate(data);
      } catch (error) {
        console.error("Error fetching template:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, []);

  const handleInputChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const submission = {
      templateId: template.id,
      answers: template.questions.map((q, index) => ({
        question: q,
        answer: answers[index] || "",
      })),
    };

    console.log("Sending this data to backend:", submission);

    try {
      const response = await fetch(`${API_URL}/api/testimonials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
      });
      if (!response.ok) {
        throw new Error("Failed to submit testimonial");
      }
    } catch (error) {
      console.error("Error submitting testimonial:", error);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
      setAnswers({});
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (submitted) {
    return (
      <div className="container">
        <h1>Thank You!</h1>
        <p>Thank you for your submission!</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{template?.name || "Testimonial Request"}</h1>
      <p>Please answer the questions below.</p>
      <form onSubmit={handleSubmit}>
        {template?.questions.map((question, index) => (
          <div key={index} className="form-group">
            <label htmlFor={`question-${index}`}>{question}</label>
            <textarea
              rows="4"
              values={answers[index] || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
              required
            ></textarea>
          </div>
        ))}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default App;
