import { Link } from "react-router-dom";
import {
  Shield, Upload, FileSearch, CheckCircle, ArrowRight,
  AlertTriangle, Zap, BarChart3, Camera, Leaf, Sparkles
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream-200">
      {/* ── Header: Warm, minimal nav ── */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand to-brand-800 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-stone-900 text-xl">Zareb</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm !py-2.5 !px-6">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero: Warm, editorial, pain-point focused ── */}
      <section className="relative overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 gradient-warm" />
        <div className="absolute inset-0 pattern-dots opacity-30" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-pill text-sm font-medium border border-brand/10 mb-10">
            <Shield className="w-4 h-4" />
            For African food founders exporting to EU &amp; UK
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-stone-900 text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-8 max-w-5xl mx-auto tracking-tight">
            Know your compliance gaps{' '}
            <span className="text-brand bg-brand-50/50 px-3 py-1 rounded-2xl">before the auditor does.</span>
          </h1>

          {/* Subhead */}
          <p className="text-lg md:text-xl text-stone-500 max-w-3xl mx-auto mb-12 leading-relaxed">
            You've spent months perfecting your product. But one missing label requirement
            can sink your EU/UK export deal. <span className="text-stone-700 font-medium">Zareb scans your documents</span> — 
            HACCP plans, ingredient lists, labels — and tells you exactly what's missing 
            before you ship.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base inline-flex items-center gap-2 !py-4 !px-10 shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/25 transition-shadow">
              Check your documents free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="btn-secondary text-base inline-flex items-center gap-2 !py-4 !px-10">
              <Camera className="w-5 h-5" /> Scan a label
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-8 text-sm text-stone-400">
            <span>Used by founders in</span>
            <span className="font-medium text-stone-500">Lagos</span>
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
            <span className="font-medium text-stone-500">Accra</span>
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
            <span className="font-medium text-stone-500">Nairobi</span>
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
            <span className="font-medium text-stone-500">Kampala</span>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white section-warm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-display text-brand font-semibold text-sm tracking-widest uppercase">How it works</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mt-3 mb-4">
              Three steps to export-ready
            </h2>
            <p className="text-lg text-stone-500 max-w-2xl mx-auto">
              No complex compliance software. Upload, scan, and know exactly where you stand.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Camera,
                title: "Snap or upload",
                desc: "Take a photo of your product label or upload your HACCP plan, ingredient list, or audit report. PDF, DOCX, JPG — whatever you have.",
                step: "01"
              },
              {
                icon: Zap,
                title: "AI checks in 30 seconds",
                desc: "Zareb scans your document against BRCGS, HACCP, FSMA, SQF, ISO 22000, NAFDAC, KEBS, or EU Food Law.",
                step: "02"
              },
              {
                icon: BarChart3,
                title: "Know your gaps instantly",
                desc: "A clear compliance score, critical gaps ranked by severity, and copy-paste fixes you can use immediately.",
                step: "03"
              }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="text-center p-8 rounded-2xl border border-stone-100 bg-white shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-50 to-cream-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8 text-brand" />
                  </div>
                  <span className="font-display text-5xl font-bold text-stone-100 absolute top-4 right-6 -z-0 select-none">
                    {step.step}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-stone-900 mb-3 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-stone-500 leading-relaxed relative z-10">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real problems founders face ── */}
      <section className="section-warm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-display text-brand font-semibold text-sm tracking-widest uppercase">Why it matters</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mt-3 mb-4">
              Failed an audit before? Here's why.
            </h2>
            <p className="text-lg text-stone-500 max-w-2xl mx-auto">
              African food founders lose millions to failed audits. Zareb catches what you'd miss.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: AlertTriangle,
                title: "Trying to export to Sainsbury's or Whole Foods?",
                desc: "They require BRCGS certification. Zareb checks if you're ready before you apply.",
                color: "warning"
              },
              {
                icon: AlertTriangle,
                title: "NAFDAC approved ≠ EU approved",
                desc: "Nigeria's approval doesn't transfer. EU has stricter allergen, labeling, and novel food rules.",
                color: "danger"
              },
              {
                icon: AlertTriangle,
                title: "EU Novel Food rules blocked your last export?",
                desc: "If your product contains baobab, moringa, or other African ingredients — Zareb flags whether they need EU authorization first.",
                color: "brand"
              }
            ].map((pain, i) => (
              <div key={i} className={`card-warm border-l-4 border-l-${pain.color === 'brand' ? 'brand' : pain.color} hover:shadow-card-hover transition-all duration-200`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  pain.color === 'warning' ? 'bg-warning-50 text-warning' :
                  pain.color === 'danger' ? 'bg-danger-50 text-danger' :
                  'bg-brand-50 text-brand'
                }`}>
                  <pain.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-stone-900 mb-2">{pain.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{pain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is Zareb for? ── */}
      <section className="bg-white section-warm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-display text-brand font-semibold text-sm tracking-widest uppercase">Who it's for</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mt-3 mb-4">
              Built for African food founders
            </h2>
            <p className="text-lg text-stone-500 max-w-2xl mx-auto">
              Whether you're a spice exporter in Accra or a snack brand in Lagos — Zareb speaks your standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              "Snack and beverage brands exporting to UK grocers",
              "Spice and superfood exporters needing EU Novel Food clearance",
              "Processed food manufacturers seeking BRCGS or FSSC 22000",
              "Organic and natural product brands targeting EU organic certification"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-brand" />
                </div>
                <p className="text-stone-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="gradient-brand section-warm">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to know where you stand?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Free for your first 3 documents. No credit card. No commitment.
            In 30 seconds, you'll know exactly what's missing.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-3 bg-white text-brand-700 font-semibold py-4 px-10 rounded-pill text-lg hover:bg-stone-50 transition-all duration-200 shadow-xl shadow-black/10 hover:shadow-2xl"
          >
            Check your first document free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">Zareb</span>
            </div>
            <div className="text-center md:text-right">
              <p className="font-medium text-white text-sm mb-1">
                Free for your first 3 documents. No credit card.
              </p>
              <p className="text-sm text-stone-500">
                &copy; 2026 Zareb. Built for African food founders, by founders.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
