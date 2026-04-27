export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#000000" }}
    >
      <div className="w-full max-w-[340px]">
        <div className="mb-9 text-center">
          <p
            className="text-[22px] font-semibold"
            style={{ letterSpacing: "-0.022em", color: "#F5F5F7" }}
          >
            AccioChat
          </p>
          <p className="text-[13px] mt-1.5" style={{ color: "rgba(235,235,245,0.45)" }}>
            Instagram Automation Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
