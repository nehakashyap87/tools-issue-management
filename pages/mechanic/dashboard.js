import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();
  const [tools, setTools] = useState([]);
  const [issues, setIssues] = useState([]);
  const [mechanic, setMechanic] = useState(null);
  const [loadingAction, setLoadingAction] = useState({});

  // Verify Mechanic Authentication
  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");
    if (!sessionUser) {
      router.push("/login");
      return;
    }
    try {
      const userObj = JSON.parse(sessionUser);
      if (userObj.role !== "mechanic") {
        router.push("/login");
        return;
      }
      setMechanic(userObj);
    } catch (e) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (!mechanic) return;

    fetchTools();
    fetchIssues();

    // Auto-refresh every 5 seconds to keep sync
    const interval = setInterval(() => {
      fetchTools();
      fetchIssues();
    }, 5000);

    return () => clearInterval(interval);
  }, [mechanic]);

  const fetchTools = async () => {
    try {
      const res = await fetch("/api/tools");
      if (res.ok) {
        const data = await res.json();
        setTools(data);
      }
    } catch (err) {
      console.error("Error fetching tools:", err);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (err) {
      console.error("Error fetching issues:", err);
    }
  };

  const issueTool = async (toolId) => {
    if (!mechanic) return;
    
    setLoadingAction(prev => ({ ...prev, [`issue-${toolId}`]: true }));

    try {
      const res = await fetch("/api/tools/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId,
          mid: mechanic.id,
          mechanicName: mechanic.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to issue tool");
      }

      alert(data.message);
      fetchTools();
      fetchIssues();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAction(prev => ({ ...prev, [`issue-${toolId}`]: false }));
    }
  };

  const returnTool = async (issueId) => {
    setLoadingAction(prev => ({ ...prev, [`return-${issueId}`]: true }));

    try {
      const res = await fetch("/api/tools/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issueId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to return tool");
      }

      alert(data.message);
      fetchTools();
      fetchIssues();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAction(prev => ({ ...prev, [`return-${issueId}`]: false }));
    }
  };

  // Filter issues belonging to this logged-in mechanic
  const mechanicIssues = issues.filter(
    (issue) => mechanic && String(issue.mid) === String(mechanic.id)
  );

  if (!mechanic) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar title="Mechanic Panel" />
      <div className="container-fluid min-vh-100 py-5 bg-light">
        <div className="container">
          
          {/* Welcome Profile Bar */}
          <div className="glass-card p-4 mb-5 border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <img
                src={mechanic.picture || "/register/user-icon.webp"}
                alt={mechanic.name}
                className="rounded-circle border border-3 border-white shadow-sm"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
                onError={(e) => { e.target.src = "/register/user-icon.webp"; }}
              />
              <div>
                <h2 className="fw-bold mb-1">Welcome, {mechanic.name}!</h2>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="badge bg-primary px-3 py-1.5 rounded-pill text-uppercase">
                    Skill Level: {mechanic.level}
                  </span>
                  <span className="text-muted fs-7">
                    <i className="bi bi-phone"></i> {mechanic.mobile}
                  </span>
                  <span className="text-muted fs-7 ms-md-2">
                    <i className="bi bi-envelope"></i> {mechanic.email}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-dark text-white rounded-3 p-3 text-center text-md-end">
              <h6 className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '0.7rem' }}>
                Tools in Hand
              </h6>
              <h4 className="fw-bold mb-0">
                {mechanicIssues.filter(i => i.status === "Issued").length} Items
              </h4>
            </div>
          </div>

          {/* Available Tools Selection */}
          <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-wrench-adjustable text-primary"></i> Available Inventory
          </h3>
          
          <div className="row mb-5">
            {tools.length === 0 ? (
              <div className="col-12 text-center py-5 glass-card">
                <p className="text-muted mb-0">No tools available in the inventory.</p>
              </div>
            ) : (
              tools.map((tool) => (
                <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={tool.id}>
                  <div className="glass-card border-0 rounded-4 overflow-hidden h-100 d-flex flex-column">
                    <div className="position-relative bg-white d-flex align-items-center justify-content-center p-3" style={{ height: "160px" }}>
                      <img
                        src={tool.image}
                        alt={tool.toolName}
                        className="img-fluid"
                        style={{ maxHeight: "100%", objectFit: "contain" }}
                        onError={(e) => { e.target.src = "/tools/wrench.jpg"; }}
                      />
                      <span className="position-absolute top-2 start-2 badge-category">
                        {tool.category}
                      </span>
                    </div>
                    
                    <div className="card-body p-4 d-flex flex-column justify-content-between flex-grow-1">
                      <div>
                        <h5 className="fw-bold text-dark mb-1">{tool.toolName}</h5>
                        <p className="text-muted mb-3 fs-7">Available Stock: <strong>{tool.quantity}</strong></p>
                      </div>

                      <button
                        className={`btn w-100 py-2 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-1 ${
                          tool.quantity <= 0 ? "btn-secondary" : "btn-primary"
                        }`}
                        disabled={tool.quantity <= 0 || loadingAction[`issue-${tool.id}`]}
                        onClick={() => issueTool(tool.id)}
                        style={tool.quantity > 0 ? { background: 'var(--primary-gradient)', border: 'none' } : {}}
                      >
                        {loadingAction[`issue-${tool.id}`] ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : tool.quantity <= 0 ? (
                          "Out Of Stock"
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-down-left"></i> Get Tool Issued
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <hr className="my-5" />

          {/* My Issued Tools Table/Grid */}
          <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-journal-arrow-down text-warning"></i> My Issued Tools
          </h3>

          <div className="row">
            {mechanicIssues.length === 0 ? (
              <div className="col-12 text-center py-5 glass-card bg-white">
                <i className="bi bi-clipboard2-check fs-1 text-muted d-block mb-2"></i>
                <p className="text-muted mb-0">You do not have any tools issued at the moment.</p>
              </div>
            ) : (
              mechanicIssues.map((issue) => (
                <div className="col-md-4 mb-4" key={issue.id}>
                  <div className="glass-card border-0 rounded-4 overflow-hidden h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold text-dark mb-0">{issue.toolName}</h5>
                        <span className={`badge ${
                          issue.status === "Issued" ? "bg-warning text-dark" : "bg-success"
                        } px-2 py-1 rounded-pill`} style={{ fontSize: '0.7rem' }}>
                          {issue.status}
                        </span>
                      </div>
                      
                      <p className="text-muted fs-7 mb-4">
                        Issued on: {new Date(issue.issueDate).toLocaleString()}
                        {issue.returnDate && (
                          <span className="d-block text-success mt-1">
                            Returned on: {new Date(issue.returnDate).toLocaleString()}
                          </span>
                        )}
                      </p>

                      {issue.status === "Issued" ? (
                        <button
                          className="btn btn-warning w-100 py-2 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-1"
                          onClick={() => returnTool(issue.id)}
                          disabled={loadingAction[`return-${issue.id}`]}
                        >
                          {loadingAction[`return-${issue.id}`] ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <>
                              <i className="bi bi-arrow-return-left"></i> Return Tool
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-secondary w-100 py-2 rounded-pill"
                          disabled
                        >
                          <i className="bi bi-check-lg"></i> Returned
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
      
      <style jsx>{`
        .fs-7 {
          font-size: 0.85rem;
        }
        .top-2 {
          top: 0.5rem;
        }
        .start-2 {
          left: 0.5rem;
        }
      `}</style>
    </>
  );
}