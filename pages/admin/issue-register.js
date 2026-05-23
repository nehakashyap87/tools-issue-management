import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";

export default function IssueRegister() {
  const router = useRouter();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Validate Admin Session
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

    fetchIssues();
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, [isAdmin]);

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

  // Handle Search and Filter logic
  useEffect(() => {
    let result = issues;

    // Filter by search term (tool name or mechanic name)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (issue) =>
          issue.toolName.toLowerCase().includes(term) ||
          issue.mechanicName.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      result = result.filter((issue) => issue.status === statusFilter);
    }

    // Sort by newest first
    setFilteredIssues([...result].reverse());
  }, [issues, searchTerm, statusFilter]);

  if (!isAdmin) {
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
      <Navbar title="Admin Dashboard" />
      <div className="container-fluid min-vh-100 py-5 bg-light">
        <div className="container">
          
          {/* Header */}
          <div className="row align-items-center justify-content-between mb-4">
            <div className="col-md-8">
              <h1 className="fw-bold">Tool Issue Register</h1>
              <p className="text-muted">Review history logs of all issued and returned tools</p>
            </div>
            
            <div className="col-md-4 text-md-end">
              <button 
                className="btn btn-dark rounded-pill px-4"
                onClick={() => router.push("/admin/dashboard")}
              >
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-4 mb-4">
            <div className="row g-3">
              {/* Search Bar */}
              <div className="col-md-7">
                <label className="form-label fw-semibold">Search Records</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by tool name or mechanic name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="col-md-5">
                <label className="form-label fw-semibold">Filter by Status</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-filter"></i>
                  </span>
                  <select
                    className="form-select border-start-0"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Issued">Issued</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Register Table */}
          <div className="glass-card overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="px-4 py-3">Issue ID</th>
                    <th className="py-3">Tool Title</th>
                    <th className="py-3">Mechanic</th>
                    <th className="py-3">Level</th>
                    <th className="py-3">Date Issued</th>
                    <th className="py-3">Date Returned</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <i className="bi bi-folder-x fs-1 d-block mb-2 text-secondary"></i>
                        No issue records match the search parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => (
                      <tr key={issue.id} className="animate-fade-in">
                        <td className="px-4 text-muted fs-8">#{issue.id}</td>
                        <td className="fw-bold">{issue.toolName}</td>
                        <td>{issue.mechanicName}</td>
                        <td>
                          <span className="badge bg-secondary">{issue.mechanicLevel || 'Trainee'}</span>
                        </td>
                        <td>
                          <div className="fs-7.5">
                            {new Date(issue.issueDate).toLocaleDateString()}
                          </div>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {new Date(issue.issueDate).toLocaleTimeString()}
                          </small>
                        </td>
                        <td>
                          {issue.returnDate ? (
                            <>
                              <div className="fs-7.5">
                                {new Date(issue.returnDate).toLocaleDateString()}
                              </div>
                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {new Date(issue.returnDate).toLocaleTimeString()}
                              </small>
                            </>
                          ) : (
                            <span className="text-muted italic fs-7.5">-</span>
                          )}
                        </td>
                        <td className="px-4 text-center">
                          <span className={`badge px-3 py-2 rounded-pill fs-7 fw-medium ${
                            issue.status === "Issued" 
                              ? "bg-warning text-dark" 
                              : "bg-success text-white"
                          }`}>
                            {issue.status === "Issued" ? (
                              <><i className="bi bi-exclamation-circle me-1"></i> Issued</>
                            ) : (
                              <><i className="bi bi-check-circle me-1"></i> Returned</>
                            )}
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
        .fs-7.5 {
          font-size: 0.85rem;
          font-weight: 500;
        }
        .fs-8 {
          font-size: 0.8rem;
        }
        .italic {
          font-style: italic;
        }
      `}</style>
    </>
  );
}