export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} CineBook. Book your next movie experience.</p>
      </div>
    </footer>
  );
}
