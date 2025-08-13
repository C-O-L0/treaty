import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = import.meta.env.API_URL || "http://localhost:3001";

function Analytics() {
  const [summary, setSummary] = useState(null);
  const { authHeader } = useAuth();

  useEffect(() => {
    fetch(`${API_URL}/api/track/analyze`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        return response.json();
      })
      .then((data) => {
        setSummary(data);
      })
      .catch((error) => {
        console.error("Error fetching analytics data:", error);
      });
  }, []);

  if (!summary) {
    return <div>Loading analytics...</div>;
  }

  const chartData = {
    labels: ["generated", "opened", "submitted"],
    datasets: [
      {
        label: "# of Events",
        data: [summary.generated, summary.opened, summary.submitted],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
      },
    ],
  };

  return (
    <div className="analytics-container">
      <h3>Analytics Overview</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          margin: "20px 0",
        }}
      >
        <span>
          <b>Open Rate:</b> {summary.openRate}%
        </span>
        <span>
          <b>Submission Rate:</b> {summary.submissionRate}%
        </span>
      </div>
      <Bar data={chartData} />
    </div>
  );
}

export default Analytics;
