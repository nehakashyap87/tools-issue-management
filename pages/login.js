import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  // Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save user session
      sessionStorage.setItem('user', JSON.stringify(data.user));

      // Redirect depending on user role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/mechanic/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5 main">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4 animate-fade-in">
            <div className="glass-card p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle p-3 mb-2">
                  <i className="bi bi-shield-lock-fill fs-3"></i>
                </div>
                <h2 className="fw-bold">Sign In</h2>
                <p className="text-muted">Enter credentials to access your portal</p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center rounded-3 py-2 px-3 mb-4 fs-6" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      className="form-control border-start-0"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock"></i></span>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      className="form-control border-start-0"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="btn btn-dark w-100 py-2.5 fs-5 mb-3"
                  disabled={loading}
                  style={{ background: 'var(--dark-gradient)', border: 'none' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>

                <div className="text-center mt-3">
                  <span className="text-muted">Not registered? </span>
                  <Link href="/register" className="text-primary fw-bold text-decoration-none hover-underline">
                    Register here
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}