import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Navbar({ title }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");
    if (sessionUser) {
      try {
        setUser(JSON.parse(sessionUser));
      } catch (e) {
        console.error("Failed to parse session user", e);
      }
    }
  }, []);

  const logout = () => {
    sessionStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm py-3">
      <div className="container-fluid max-width-container">
        
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-gradient">
          <i className="bi bi-tools text-primary"></i>
          <span>{title || "Tools Management System"}</span>
        </Link>

        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2">
            {user?.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link 
                    href="/admin/dashboard" 
                    className={`nav-link px-3 rounded-3 ${router.pathname === '/admin/dashboard' ? 'active bg-white bg-opacity-10 fw-semibold text-white' : ''}`}
                  >
                    Inventory
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/admin/add-tool" 
                    className={`nav-link px-3 rounded-3 ${router.pathname === '/admin/add-tool' ? 'active bg-white bg-opacity-10 fw-semibold text-white' : ''}`}
                  >
                    Add Tool
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/admin/issue-register" 
                    className={`nav-link px-3 rounded-3 ${router.pathname === '/admin/issue-register' ? 'active bg-white bg-opacity-10 fw-semibold text-white' : ''}`}
                  >
                    Issue Register
                  </Link>
                </li>
              </>
            )}

            {user?.role === 'mechanic' && (
              <li className="nav-item">
                <Link 
                  href="/mechanic/dashboard" 
                  className={`nav-link px-3 rounded-3 ${router.pathname === '/mechanic/dashboard' ? 'active bg-white bg-opacity-10 fw-semibold text-white' : ''}`}
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>

          {/* User Profile & Logout */}
          {user ? (
            <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
              <div className="d-flex align-items-center gap-2">
                <img 
                  src={user.picture || '/register/user-icon.webp'} 
                  alt="Profile" 
                  width={50}
                  className="rounded-circle border border-2 border-primary "
                  onError={(e) => { e.target.src = '/register/user-icon.webp'; }}
                />
                <div className="d-none d-md-block text-start" >
                  <div className="text-white fw-bold fs-6">{user.name}</div>
                  <small className="text-muted text-uppercase">
                    {user.role === 'admin' ? 'Administrator' : `${user.level} Mechanic`}
                  </small>
                </div>
              </div>

              <button className="btn btn-outline-danger btn-sm px-3 rounded-pill" onClick={logout}>
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link href="/login" className="btn btn-outline-light btn-sm px-3 rounded-pill">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm px-3 rounded-pill">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .text-gradient {
          background: linear-gradient(90deg, #60a5fa, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .max-width-container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>
    </nav>
  );
}