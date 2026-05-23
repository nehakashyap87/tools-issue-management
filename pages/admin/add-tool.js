import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function AddTool() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const [tool, setTool] = useState({
    toolName: "",
    category: "",
    quantity: "1",
    image: "",
  });

  // Verify Admin Authentication
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

  const handleChange = (e) => {
    setTool({
      ...tool,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Convert uploaded image file to Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTool({
          ...tool,
          image: reader.result,
        });
        setPreviewImage(reader.result);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  // Category fallback images
  const getCategoryFallbackImage = (category) => {
    switch (category) {
      case "Hammer":
        return "/tools/hammer-tool.jpg";
      case "Wrench":
        return "/tools/wrench.jpg";
      case "Screw Driver":
        return "/tools/screw-driver.png";
      case "Plier":
        return "/tools/plier.jfif";
      default:
        return "/tools/wrench.jpg";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Form Validation
    if (!tool.toolName.trim()) {
      setError("Tool name is required");
      return;
    }
    if (!tool.category) {
      setError("Please select a category");
      return;
    }
    if (!tool.quantity || Number(tool.quantity) <= 0) {
      setError("Quantity must be a positive number greater than 0");
      return;
    }

    setLoading(true);

    try {
      // If no image is provided, assign a default category-based image
      const finalImage = tool.image || getCategoryFallbackImage(tool.category);
      
      const payload = {
        ...tool,
        image: finalImage,
        quantity: Number(tool.quantity)
      };

      const res = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add tool");
      }

      alert("Tool Added successfully!");
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  return (
    <>
      <Navbar title="Admin Dashboard" />
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center py-5 bg-light">
        <div className="col-md-8 col-lg-5 animate-fade-in">
          <div className="card border-0 shadow-lg p-4 p-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="fw-bold mb-1">Add New Tool</h2>
                <p className="text-muted mb-0">
                  Insert tools into the inventory room
                </p>
              </div>

              <button
                className="btn btn-outline-dark px-4 rounded-pill"
                onClick={() => router.push("/admin/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center rounded-3 py-2 px-3 mb-4 fs-6" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Tool Image Selection / Preview */}
              <div className="mb-4 text-center">
                <label className="form-label d-block fw-semibold text-start mb-2">Tool Illustration</label>
                <div className="position-relative d-inline-block">
                  <div 
                    className="border rounded-4 d-flex align-items-center justify-content-center bg-white shadow-sm overflow-hidden"
                    style={{ width: '160px', height: '120px' }}
                  >
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Tool Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                      />
                    ) : (
                      <div className="text-muted text-center p-2">
                        <i className="bi bi-image fs-1 d-block text-secondary"></i>
                        <span className="fs-7">No Image Chosen</span>
                      </div>
                    )}
                  </div>
                  <label 
                    htmlFor="tool-image-upload" 
                    className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm"
                    style={{ width: '32px', height: '32px', transform: 'translate(25%, 25%)' }}
                  >
                    <i className="bi bi-upload"></i>
                    <input
                      type="file"
                      id="tool-image-upload"
                      name="imageFile"
                      accept="image/*"
                      className="d-none"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <div className="mt-3">
                  <span className="text-muted fs-7">Or leave blank to auto-assign a standard category icon.</span>
                </div>
              </div>

              {/* Tool Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Tool Name</label>
                <input
                  type="text"
                  name="toolName"
                  value={tool.toolName}
                  placeholder="Enter tool name (e.g. Claw Hammer, Adjustable Wrench)"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Category</label>
                <select
                  name="category"
                  value={tool.category}
                  className="form-select"
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="Hammer">Hammer</option>
                  <option value="Wrench">Wrench</option>
                  <option value="Screw Driver">Screw Driver</option>
                  <option value="Plier">Plier</option>
                </select>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Available Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={tool.quantity}
                  placeholder="Quantity (inventory number)"
                  className="form-control"
                  min="1"
                  onChange={handleChange}
                />
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-between align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-light px-4 py-2 w-50"
                  onClick={() => router.push("/admin/dashboard")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 w-50 shadow-sm"
                  style={{ background: 'var(--primary-gradient)', border: 'none' }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    "+ Add Tool"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .fs-7 {
          font-size: 0.8rem;
        }
      `}</style>
    </>
  );
}