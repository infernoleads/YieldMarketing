// client/src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center grid-bg px-6" style={{ background: "var(--bg)" }}>
      <div className="text-center fade-in">
        <div className="flex justify-center mb-6"><BrandMark size={52} /></div>
        <div className="font-display font-bold" style={{ color: "var(--lime-400)", fontSize: "clamp(3rem,10vw,6rem)", lineHeight: 1 }}>404</div>
        <h1 className="font-display font-semibold text-xl mt-4" style={{ color: "var(--text)" }}>Page not found</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="btn btn-primary mt-7">Back to home</Link>
      </div>
    </div>
  );
}
