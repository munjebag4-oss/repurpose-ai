import "./globals.css";

export const metadata = {
  title: "RepurposeAI - Turn One Post Into 5 Formats",
  description: "Paste a blog post, get X tweet, LinkedIn post, Instagram caption, newsletter summary, and YouTube script instantly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
