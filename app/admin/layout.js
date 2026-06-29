export const metadata = {
  title: "Zayelle Admin Dashboard",
  description: "Secure admin dashboard for Zayelle",
};

export default function AdminLayout({ children }) {
  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", color: "#333" }}>
      {children}
    </div>
  );
}
