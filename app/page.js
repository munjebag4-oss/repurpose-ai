"use client";
import { useState } from "react";

const FORMATS = [
  { id: "tweet", label: "X / Twitter", icon: "𝕏", desc: "280-char post" },
  { id: "linkedin", label: "LinkedIn", icon: "in", desc: "Professional post" },
  { id: "instagram", label: "Instagram", icon: "📷", desc: "Caption + hashtags" },
  { id: "newsletter", label: "Newsletter", icon: "✉️", desc: "Email summary" },
  { id: "youtube", label: "YouTube Script", icon: "▶️", desc: "Shorts script" },
];

function Landing({ onTryNow }) {
  return (
    <section className="max-w-3xl mx-auto text-center pt-20 pb-16 px-6">
      <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full mb-6">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        AI Content Repurposing
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
        One post becomes
        <br />
        <span className="text-emerald-400">five formats instantly</span>
      </h1>
      <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
        Paste a blog post. Get an X tweet, LinkedIn post, Instagram caption,
        newsletter summary, and YouTube script in seconds.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button onClick={onTryNow} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-sm">
          Try Free — No Signup
        </button>
        <span className="text-gray-500 text-sm">3 free uses / day</span>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
        {FORMATS.map((f) => (
          <div key={f.id} className="bg-[#12121a] border border-[#1e1e2e] rounded-lg px-4 py-2 text-sm">
            <span className="mr-1.5">{f.icon}</span>
            <span className="text-gray-400">{f.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Generator() {
  const [content, setContent] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [uses, setUses] = useState(0);
  const MAX_FREE = 3;

  const generate = async () => {
    if (!content.trim() || uses >= MAX_FREE) return;
    setLoading(true);
    setResults(null);
    setCopied("");
    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, formats: FORMATS.map((f) => f.id) }),
      });
      const data = await res.json();
      if (data.formats) {
        setResults(data.formats);
        setUses((u) => u + 1);
      } else {
        setResults({ error: "Something went wrong. Please try again." });
      }
    } catch {
      setResults({ error: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <section id="generator" className="max-w-3xl mx-auto px-6 pb-12 fade-in">
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Paste Your Content</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Paste your blog post, article, or any long-form content here..."
          className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">{content.length} characters</span>
          <button
            onClick={generate}
            disabled={loading || !content.trim() || uses >= MAX_FREE}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            {loading ? (
              <><span className="loading-dot w-1.5 h-1.5 bg-white rounded-full" /><span className="loading-dot w-1.5 h-1.5 bg-white rounded-full" /><span className="loading-dot w-1.5 h-1.5 bg-white rounded-full" /></>
            ) : uses >= MAX_FREE ? (
              "Free limit reached"
            ) : (
              `Repurpose (${MAX_FREE - uses} free left)`
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && !results.error && (
        <div className="mt-6 space-y-4 fade-in">
          {FORMATS.map((f) => (
            results[f.id] && (
              <div key={f.id} className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-sm font-semibold text-white">{f.label}</span>
                    <span className="text-xs text-gray-500">{f.desc}</span>
                  </div>
                  <button
                    onClick={() => copy(results[f.id], f.id)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {copied === f.id ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap text-gray-300">
                  {results[f.id]}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {results?.error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400 fade-in">
          {results.error}
        </div>
      )}

      {uses >= MAX_FREE && (
        <div className="mt-6 text-center fade-in">
          <p className="text-gray-500 text-sm mb-3">Unlock unlimited repurposing for $9/month</p>
          <a href={process.env.NEXT_PUBLIC_PAYPAL_SUBSCRIBE_URL || "#"} className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
            Upgrade to Pro — $9/mo
          </a>
        </div>
      )}
    </section>
  );
}

function Pricing() {
  return (
    <section className="max-w-3xl mx-auto px-6 pb-20">
      <h2 className="text-2xl font-bold text-center mb-8">Simple Pricing</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-6">
          <div className="text-sm text-gray-500 mb-1">Free</div>
          <div className="text-3xl font-bold mb-4">$0<span className="text-base font-normal text-gray-500">/mo</span></div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 3 repurposes per day</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> All 5 formats</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> No signup required</li>
          </ul>
        </div>
        <div className="bg-[#12121a] border-2 border-emerald-500/50 rounded-xl p-6 relative">
          <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">POPULAR</div>
          <div className="text-sm text-gray-500 mb-1">Pro</div>
          <div className="text-3xl font-bold mb-4">$9<span className="text-base font-normal text-gray-500">/mo</span></div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Unlimited repurposes</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> All 5 formats</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Custom tone & style</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Priority support</li>
          </ul>
          <a href={process.env.NEXT_PUBLIC_PAYPAL_SUBSCRIBE_URL || "#"} className="block mt-6 bg-emerald-500 hover:bg-emerald-600 text-white text-center font-semibold py-2.5 rounded-lg transition-colors text-sm">
            Start Pro — $9/mo
          </a>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "How does RepurposeAI work?", a: "Paste any blog post or article. Our AI adapts it into 5 platform-native formats: X tweet, LinkedIn post, Instagram caption, email newsletter, and YouTube Shorts script." },
    { q: "Is it really free?", a: "Yes! Get 3 free repurposes per day with no signup. Upgrade to Pro for $9/month for unlimited use." },
    { q: "What formats are supported?", a: "X/Twitter (280 chars), LinkedIn (professional post), Instagram (caption + hashtags), Newsletter (email summary), and YouTube Shorts script." },
    { q: "Is my content stored?", a: "No. Your content is processed in real-time and never stored on our servers." },
  ];
  return (
    <section className="max-w-2xl mx-auto px-6 pb-20">
      <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-[#12121a] border border-[#1e1e2e] rounded-lg overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-white hover:text-emerald-300 transition-colors">
              {faq.q}<span className="text-gray-500 ml-2">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed fade-in">{faq.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const scrollTo = () => document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="font-bold text-lg"><span className="text-emerald-400">Repurpose</span>AI</div>
        <a href={process.env.NEXT_PUBLIC_PAYPAL_SUBSCRIBE_URL || "#"} className="text-sm text-gray-400 hover:text-white transition-colors">Upgrade to Pro</a>
      </nav>
      <Landing onTryNow={scrollTo} />
      <Generator />
      <Pricing />
      <FAQ />
      <footer className="border-t border-[#1e1e2e] py-8 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} RepurposeAI. Turn one post into five.
        <span className="mx-2">·</span>
        <a href="https://getcoldmail.com" className="text-emerald-400 hover:text-emerald-300">Also try ColdMailAI</a>
      </footer>
    </main>
  );
}
