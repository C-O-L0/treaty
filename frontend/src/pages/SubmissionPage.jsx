import { useState, useEffect } from "react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function SubmissionPage() {
  // State for questions we fetch from the API
  const [template, setTemplate] = useState(null);
  // State for user's answers
  const [answers, setAnswers] = useState({});
  // State for media file (if any)
  const [media, setMedia] = useState(null);
  // State for loading and submission status
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parameters from the URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get("requestId");
  const templateId = urlParams.get("templateId");

  useEffect(() => {
    if (!requestId || !templateId) {
      console.error("Missing requestId or templateId in URL");
      return;
    }
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`${API_URL}/api/templates/${templateId}`); // Hardcoded template ID for simplicity
        const data = await response.json();
        setTemplate(data);
      } catch (error) {
        console.error("Error fetching template:", error);
      } finally {
        setLoading(false);
      }
    };

    const trackOpen = async () => {
      // Log 'opened' event
      try {
        await fetch(`${API_URL}/api/track/open`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId }),
        });
      } catch (error) {
        console.error("Error tracking open event:", error);
      }
    };

    fetchTemplate();
    trackOpen();
  }, [templateId, requestId]);

  const handleInputChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Prepare form data for submission
    const formData = new FormData();

    const answerPayload = template.questions.map((q, index) => ({
      question: q,
      answer: answers[index] || "",
    }));

    // Append all data fields
    formData.append("templateId", template.id);
    formData.append("answers", JSON.stringify(answerPayload));

    if (media) {
      formData.append("media", media);
    }

    try {
      const response = await fetch(
        `${API_URL}/api/testimonials?requestId=${requestId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit testimonial");
      }

      const result = await response.json();
      console.log("Submission successful:", result);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      alert("There was an error submitting your testimonial.");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
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
        <div className="form-group">
          <label htmlFor="media">Upload Media (optional)</label>
          <input
            type="file"
            id="media"
            accept="image/*, audio/*, video/*"
            onChange={(e) => setMedia(e.target.files[0])}
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default SubmissionPage;
