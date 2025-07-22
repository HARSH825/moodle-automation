export default function Footer() {
  return (
    <footer className="py-8 bg-card text-subtext flex flex-col items-center">
      <div className="mb-2">© {new Date().getFullYear()} AI Assignment Platform</div>
      <div className="flex gap-4">
        <a href="/terms" className="hover:underline text-primary">Terms</a>
        <a href="/privacy" className="hover:underline text-primary">Privacy</a>
      </div>
    </footer>
  );
}
