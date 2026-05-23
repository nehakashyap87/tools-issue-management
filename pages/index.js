import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
      <div className="container-fluid min-vh-100 d-flex align-items-center main">
        <div className="container text-white">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="fw-bold display-4">
                Tools Issue Management System
              </h1>
              <p className="mt-3 fs-5 text-light">
                Manage tool inventory, issue tools to mechanics, track returns,
                and maintain records efficiently with a simple dashboard.
              </p>

              <div className="d-flex gap-3 mt-4">
                <Link href="/register">
                  <button className="btn btn-light btn-lg px-4 rounded-pill shadow">
                    Register
                  </button>
                </Link>

                <Link href="/login">
                  <button className="btn btn-outline-light btn-lg px-4 rounded-pill">
                    Login
                  </button>
                </Link>
              </div>
            </div>

            <div className="col-md-6 text-center">
              <div
                className="p-4 rounded-4 shadow-lg inventory">
                <h3>🔧 Inventory Dashboard</h3>
                <p className="mb-0">
                  Track tools, manage issues & returns easily
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}