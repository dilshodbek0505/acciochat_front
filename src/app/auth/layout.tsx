export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">AccioChat</h1>
          <p className="text-muted-foreground text-sm mt-1">Instagram Automation Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
