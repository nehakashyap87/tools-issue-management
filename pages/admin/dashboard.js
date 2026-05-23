import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [selectedMechanic, setSelectedMechanic] = useState("");
  const [mechanics, setMechanics] = useState([]);
  const [tools, setTools] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [issuingState, setIssuingState] = useState({});
  const router = useRouter();

  // Verify Admin Session
  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");
    if (!sessionUser) {
      router.push("/login");
      return;
    }
    try {
      const userObj = JSON.parse(sessionUser);
      if (userObj.role !== "admin") {
        router.push("/login");
        return;
      }
      setIsAdmin(true);
    } catch (e) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    fetchTools();
    fetchIssues();
    fetchMechanics();

    const interval = setInterval(() => {
      fetchTools();
      fetchIssues();
      fetchMechanics();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const fetchMechanics = async () => {
    try {
      const res = await fetch("/api/mechanics");
      if (res.ok) {
        const data = await res.json();
        setMechanics(data);
      }
    } catch (err) {
      console.error("Error fetching mechanics:", err);
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

  const issueTool = async (toolId, mid) => {
    if (!mid) {
      alert("Please select a mechanic from the dropdown first.");
      return;
    }

    setIssuingState(prev => ({ ...prev, [toolId]: true }));

    // Find the mechanic object to pass correct name
    const mechanicObj = mechanics.find(m => String(m.id) === String(mid));

    try {
      const res = await fetch("/api/tools/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId,
          mid,
          mechanicName: mechanicObj?.name || "",
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
      setIssuingState(prev => ({ ...prev, [toolId]: false }));
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalToolsCount = tools.length;
  const totalQuantity = tools?.reduce((acc, t) => acc + (t.quantity || 0), 0);
  const activeIssues = issues?.filter(i => i.status === "Issued").length;
  const totalMechanics = mechanics.length;

  return (
    <>
      <Navbar title="Admin Dashboard" />
      <div className="container-fluid min-vh-100 py-5 bg-light">
        <div className="container">
          
          <div className="row align-items-center justify-content-between mb-5">
            <div className="col-md-7 mb-3 mb-md-0">
              <h1 className="fw-bold">Admin Inventory Dashboard</h1>
              <p className="text-muted">Manage tool allocations, inventory records, and mechanic issue registrations</p>
            </div>
            
            <div className="col-md-5 d-flex flex-wrap gap-2 justify-content-md-end align-items-center">
              <div className="flex-grow-1" style={{ maxWidth: '240px' }}>
                <select
                  className="form-select border-2 border-primary shadow-sm"
                  value={selectedMechanic}
                  onChange={(e) => setSelectedMechanic(e.target.value)}
                  style={{ borderRadius: '12px' }}
                >
                  <option value="">-- Assign Mechanic --</option>
                  {mechanics?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.level})
                    </option>
                  ))}
                </select>
              </div>

              <Link href="/admin/add-tool" className="btn btn-primary px-4 py-2 shadow-sm d-inline-flex align-items-center gap-1">
                <i className="bi bi-plus-lg"></i> Add New Tool
              </Link>
            </div>
          </div>

          <div className="row mb-5 gap-3 gap-md-0">
            <div className="col-sm-6 col-md-3 mb-3">
              <div className="glass-card p-4 border-start border-primary border-4 rounded-3 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>Total Categories</h6>
                    <h3 className="fw-bold mb-0">{totalToolsCount}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2.5">
                    <i className="bi bi-wrench-adjustable fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-3 mb-3">
              <div className="glass-card p-4 border-start border-success border-4 rounded-3 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>Total Inventory Quantity</h6>
                    <h3 className="fw-bold mb-0">{totalQuantity}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 text-success rounded-circle p-2.5">
                    <i className="bi bi-boxes fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-3 mb-3">
              <div className="glass-card p-4 border-start border-warning border-4 rounded-3 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>Tools Currently Issued</h6>
                    <h3 className="fw-bold mb-0">{activeIssues}</h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2.5">
                    <i className="bi bi-journal-arrow-up fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-3 mb-3">
              <div className="glass-card p-4 border-start border-info border-4 rounded-3 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>Registered Mechanics</h6>
                    <h3 className="fw-bold mb-0">{totalMechanics}</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 text-info rounded-circle p-2.5">
                    <i className="bi bi-people fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-stack text-primary"></i> Tool Room Stock
          </h3>
          
          <div className="row mb-5">
            {tools.length === 0 ? (
              <div className="col-12 text-center py-5 glass-card">
                <i className="bi bi-archive fs-1 text-muted mb-2 d-block"></i>
                <h5 className="text-muted">No tools found in database</h5>
                <Link href="/admin/add-tool" className="btn btn-primary btn-sm mt-2">Add First Tool</Link>
              </div>
            ) : (
              tools?.map((tool) => (
                <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={tool.id}>
                  <div className="glass-card border-0 rounded-4 overflow-hidden h-100 d-flex flex-column">
                    <div className="position-relative bg-white d-flex align-items-center justify-content-center p-3" style={{ height: "180px" }}>
                      <img
                        src={tool.image}
                        alt={tool.toolName}
                        className="img-fluid"
                        style={{
                          maxHeight: "100%",
                          objectFit: "contain",
                        }} 
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
                          tool.quantity <= 0 
                            ? "btn-secondary" 
                            : selectedMechanic 
                            ? "btn-success" 
                            : "btn-outline-primary"
                        }`}
                        disabled={tool.quantity <= 0 || issuingState[tool.id]}
                        onClick={() => issueTool(tool.id, selectedMechanic)}
                      >
                        {issuingState[tool.id] ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : tool.quantity <= 0 ? (
                          "Out Of Stock"
                        ) : selectedMechanic ? (
                          <>
                            <i className="bi bi-check-circle"></i> Issue to Selected
                          </>
                        ) : (
                          "Select Mechanic Above"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <hr className="my-5 border-2" />

          {/* Quick Issue Register */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-journal-text text-warning"></i> Recent Allocations
            </h3>
            <Link href="/admin/issue-register" className="btn btn-outline-secondary btn-sm px-3 rounded-pill">
              View Full Register <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="glass-card overflow-hidden mb-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="px-4 py-3">Tool Name</th>
                    <th className="py-3">Mechanic</th>
                    <th className="py-3">Level</th>
                    <th className="py-3">Issued Date</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">No tools issued yet.</td>
                    </tr>
                  ) : (
                    issues.slice(-5).reverse().map((issue) => (
                      <tr key={issue.id}>
                        <td className="px-4 fw-bold">{issue.toolName}</td>
                        <td>{issue.mechanicName}</td>
                        <td>
                          <span className="badge bg-secondary">{issue.mechanicLevel || 'Trainee'}</span>
                        </td>
                        <td>{issue.issueDate ? new Date(issue.issueDate).toLocaleString() : "N/A"}</td>
                        <td>
                          <span className={`badge px-3 py-2 rounded-pill fs-7 ${
                            issue.status === "Issued" 
                              ? "bg-warning text-dark" 
                              : "bg-success text-white"
                          }`}>
                            {issue.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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