import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    level: '',
    picture: ''
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field-specific error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
    setApiError("");
  };

  // Handle File Input Change (Convert to Base64)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, picture: "Image size must be less than 2MB" });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          picture: reader.result
        });
        setPreviewImage(reader.result);
        setErrors({ ...errors, picture: null });
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Validation
  const validateForm = () => {
    let newErrors = {};

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Alphanumeric with special character validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]).{6,}$/;

    // Name Validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email Validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile Validation (Exactly 10 digits)
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits';
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be alphanumeric with at least 1 special character (min 6 chars)';
    }

    // Level Validation
    if (!formData.level) {
      newErrors.level = 'Please select your skill level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Register Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    // Validate Form
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      alert('Registration Successful! Redirecting to login...');
      router.push('/login');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5 main">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 animate-fade-in">
            <div className="glass-card p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle p-3 mb-2">
                  <i className="bi bi-person-plus-fill fs-3"></i>
                </div>
                <h2 className="fw-bold">Mechanic Registration</h2>
                <p className="text-muted">Register to access the Tools Inventory system</p>
              </div>

              {apiError && (
                <div className="alert alert-danger d-flex align-items-center rounded-3 py-2 px-3 mb-4 fs-6" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{apiError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Profile Picture Upload */}
                <div className="mb-4 text-center">
                  <div className="position-relative d-inline-block">
                    <img
                      src={previewImage || '/register/user-icon.webp'}
                      alt="Profile Preview"
                      className="rounded-circle border border-3 border-white shadow-sm"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', backgroundColor: '#e2e8f0' }}
                    />
                    <label 
                      htmlFor="picture-upload" 
                      className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <i className="bi bi-camera-fill"></i>
                      <input
                        type="file"
                        id="picture-upload"
                        name="pictureFile"
                        accept="image/*"
                        className="d-none"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <div className="mt-1">
                    <small className="text-muted">Upload profile photo (Max 2MB)</small>
                  </div>
                  {errors.picture && (
                    <div className="text-danger mt-1"><small>{errors.picture}</small></div>
                  )}
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-person"></i></span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter name"
                      className={`form-control border-start-0 ${errors.name ? 'is-invalid' : ''}`}
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.name && <small className="text-danger">{errors.name}</small>}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <small className="text-danger">{errors.email}</small>}
                </div>

                {/* Mobile */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Mobile Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-phone"></i></span>
                    <input
                      type="tel"
                      name="mobile"
                      maxLength="10"
                      placeholder="10-digit mobile number"
                      className={`form-control border-start-0 ${errors.mobile ? 'is-invalid' : ''}`}
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.mobile && <small className="text-danger">{errors.mobile}</small>}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock"></i></span>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create password"
                      className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.password && <small className="text-danger">{errors.password}</small>}
                </div>

                {/* Level */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Level of Mechanic</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-graph-up"></i></span>
                    <select
                      name="level"
                      className={`form-select border-start-0 ${errors.level ? 'is-invalid' : ''}`}
                      value={formData.level}
                      onChange={handleChange}
                    >
                      <option value="">Select Skill Level</option>
                      <option value="Expert">Expert</option>
                      <option value="Medium">Medium</option>
                      <option value="New Recruit">New Recruit</option>
                      <option value="Trainee">Trainee</option>
                    </select>
                  </div>
                  {errors.level && <small className="text-danger">{errors.level}</small>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2.5 fs-5 mb-3"
                  disabled={loading}
                  style={{ background: 'var(--primary-gradient)', border: 'none' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center mt-3">
                  <span className="text-muted">Already registered? </span>
                  <Link href="/login" className="text-primary fw-bold text-decoration-none hover-underline">
                    Login here
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