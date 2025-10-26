import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { batchAPI, studentAPI, markAPI } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    totalStudents: 0,
    activeStudents: 0,
    totalMarks: 0,
  });
  const [recentBatches, setRecentBatches] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/"); 
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [batchesRes, studentsRes, marksRes] = await Promise.all([
        batchAPI.getAll(),
        studentAPI.getAll(),
        markAPI.getAll(),
      ]);

      const batches = batchesRes.data.data;
      const students = studentsRes.data.data;
      const marks = marksRes.data.data;

      setStats({
        totalBatches: batches.length,
        activeBatches: batches.filter((b) => b.isActive).length,
        totalStudents: students.length,
        activeStudents: students.filter((s) => s.isActive).length,
        totalMarks: marks.length,
      });

      setRecentBatches(batches.slice(0, 5));
      setRecentStudents(students.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};


  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: "30px" }}>
      {/* Header with logout */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#ff4b4b",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-3" style={{ marginBottom: "30px" }}>
        <div
          className="card"
          style={{
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <p style={{ marginBottom: "10px", opacity: 0.9 }}>Total Batches</p>
              <p style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "5px" }}>
                {stats.totalBatches}
              </p>
              <p style={{ fontSize: "14px", opacity: 0.8 }}>
                {stats.activeBatches} Active
              </p>
            </div>
            <div style={{ fontSize: "40px", opacity: 0.3 }}>📚</div>
          </div>
          <Link to="/batches">
            <button
              className="btn"
              style={{
                marginTop: "15px",
                background: "rgba(255,255,255,0.2)",
                color: "white",
                width: "100%",
              }}
            >
              View All Batches
            </button>
          </Link>
        </div>

        <div
          className="card"
          style={{
            background:
              "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <p style={{ marginBottom: "10px", opacity: 0.9 }}>Total Students</p>
              <p style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "5px" }}>
                {stats.totalStudents}
              </p>
              <p style={{ fontSize: "14px", opacity: 0.8 }}>
                {stats.activeStudents} Active
              </p>
            </div>
            <div style={{ fontSize: "40px", opacity: 0.3 }}>👨‍🎓</div>
          </div>
          <Link to="/students">
            <button
              className="btn"
              style={{
                marginTop: "15px",
                background: "rgba(255,255,255,0.2)",
                color: "white",
                width: "100%",
              }}
            >
              View All Students
            </button>
          </Link>
        </div>

        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <p style={{ marginBottom: "10px", opacity: 0.9 }}>
                Total Mark Entries
              </p>
              <p style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "5px" }}>
                {stats.totalMarks}
              </p>
              <p style={{ fontSize: "14px", opacity: 0.8 }}>
                Across All Students
              </p>
            </div>
            <div style={{ fontSize: "40px", opacity: 0.3 }}>📊</div>
          </div>
          <Link to="/marks">
            <button
              className="btn"
              style={{
                marginTop: "15px",
                background: "rgba(255,255,255,0.2)",
                color: "white",
                width: "100%",
              }}
            >
              View All Marks
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Batches and Students */}
      <div className="grid grid-2">
        <RecentList
          title="Recent Batches"
          items={recentBatches}
          type="batch"
          link="/batches"
        />
        <RecentList
          title="Recent Students"
          items={recentStudents}
          type="student"
          link="/students"
        />
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: "30px" }}>
        <h2 style={{ marginBottom: "20px" }}>Quick Actions</h2>
        <div className="grid grid-3">
          <Link to="/batches">
            <button className="btn btn-primary" style={{ width: "100%", padding: "15px" }}>
              ➕ Add New Batch
            </button>
          </Link>
          <Link to="/students">
            <button className="btn btn-primary" style={{ width: "100%", padding: "15px" }}>
              ➕ Add New Student
            </button>
          </Link>
          <Link to="/marks">
            <button className="btn btn-primary" style={{ width: "100%", padding: "15px" }}>
              ➕ Add Mark Entry
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// ✅ Component for Recent Lists
const RecentList = ({ title, items, type, link }) => (
  <div className="card">
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}
    >
      <h2>{title}</h2>
      <Link to={link}>
        <button
          className="btn btn-secondary"
          style={{ fontSize: "12px", padding: "5px 15px" }}
        >
          View All
        </button>
      </Link>
    </div>
    {items.length === 0 ? (
      <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
        No {type}s found
      </p>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item) => (
          <Link
            to={`/${type}s/${item._id}`}
            key={item._id}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                padding: "15px",
                background: "#f9fafb",
                borderRadius: "5px",
                transition: "all 0.3s ease",
                cursor: "pointer",
                border: "1px solid #e5e7eb",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#f3f4f6")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "#f9fafb")
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {type === "batch" ? (
                    <>
                      <p
                        style={{
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: "5px",
                        }}
                      >
                        {item.batchName}
                      </p>
                      <p style={{ fontSize: "12px", color: "#6b7280" }}>
                        Code: {item.batchCode} • {item.totalStudents} Students
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: "5px",
                        }}
                      >
                        {item.firstName} {item.lastName}
                      </p>
                      <p style={{ fontSize: "12px", color: "#6b7280" }}>
                        {item.enrollmentNumber} • {item.batch?.batchName}
                      </p>
                    </>
                  )}
                </div>
                <span
                  className={`badge ${
                    item.isActive ? "badge-success" : "badge-danger"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default Dashboard;
