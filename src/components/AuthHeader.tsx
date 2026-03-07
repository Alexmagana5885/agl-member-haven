import AGLlogo from "@/components/payments/AGLlogo.png";

const AuthHeader = () => {
  return (
    <header className="w-full bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <a href="https://www.agl.or.ke/" target="_blank" rel="noopener noreferrer">
          <img src={AGLlogo} alt="AGL Logo" className="h-12 w-auto object-contain" />
        </a>
        <span className="text-primary font-bold text-sm sm:text-lg" style={{ fontFamily: "var(--font-display)" }}>
          Association of Government Librarians
        </span>
      </div>
    </header>
  );
};

export default AuthHeader;
