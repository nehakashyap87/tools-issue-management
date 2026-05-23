export default function CheckFooter() {
  return (
    <>
    <footer
      className="text-center py-2 mt-1 mb-0 footer">
      <p className="mb-0 text-white">
        © {new Date().getFullYear()} Tools Issue Management System
      </p>

      <small className="text-warning">Built for Inventory & Mechanic Management</small>
    </footer>
    </>
  );
}