import { Link } from "react-router-dom";
import {
  Shield, Upload, FileSearch, CheckCircle, ArrowRight,
  AlertTriangle, Zap, BarChart3, Camera
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen surface-canvas">
      {/* ── Header: Clean, minimal, Apple-style nav ── */}
      <header className="surface-white border-b border-[#d6d6d6]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0071E3] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-display font-semibold text-[#1d1d1f] text-xl">Zareb</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-body-sm font-semibold text-[#0066CC] hover:text-[#0071E3] transition-colors py-2 px-4"
            >
              Login
            </Link>
            <Link to="/register" className="btn-primary text-body-sm !py-2 !px-5">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero: Copywriting — Pain point → Promise → CTA ── */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#E8F4FD] text-[#0071E3] px-4 py-2 rounded-full text-body-sm font-medium mb-8">
          <Shield className="w-4 h-4" />
          For African food founders exporting to EU &amp; UK
        </div>

        {/* Headline: Benefit-driven, specific, urgent */}
        <h1 className="text-display font-display font-bold text-[#1d1d1f] leading-tight mb-6 max-w-5xl mx-auto">
          Know your compliance gaps{" "}
          <span className="text-[#0071E3]">before the auditor does.</span>
        </h1>

        {/* Subhead: Specific pain → specific solution */}
        <p className="text-body text-[#6B7280] max-w-3xl mx-auto mb-10 leading-relaxed">
          You've spent months perfecting your product. But one missing label requirement
          can sink your EU/UK export deal. <strong>Zareb scans your HACCP plans,
          ingredient lists, and food labels</strong> — then tells you exactly what's
          missing before you ship.
        </p>

        {/* CTA: Single action, benefit-forward, risk-free */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-body inline-flex items-center gap-2 !py-4 !px-8">
            Check your documents free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/register" className="btn-secondary text-body inline-flex items-center gap-2 !py-4 !px-8">
            <Camera className="w-5 h-5" /> Scan a label
          </Link>
        </div>

        {/* Social proof: Specific audience */}
        <p className="text-body-sm text-[#858585] mt-6">
          Used by food founders in Lagos &middot; Accra &middot; Nairobi &middot; Kampala
        </p>
      </section>

      {/* ── How It Works: Three simple steps ── */}
      <section className="surface-white section-apple">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-display-xxl font-display font-semibold text-center text-[#1d1d1f] mb-4">
            Three steps to export-ready
          </h2>
          <p className="text-body text-[#6B7280] text-center mb-12 max-w-2xl mx-auto">
            No complex compliance software. Upload, scan, and know exactly where you stand.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "Snap or upload",
                desc: "Take a photo of your product label or upload your HACCP plan, ingredient list, or audit report. PDF, DOCX, JPG — whatever you have."
              },
              {
                icon: Zap,
                title: "AI checks in 30 seconds",
                desc: "Zareb scans your document against BRCGS, HACCP, FSMA, SQF, ISO 22000, NAFDAC, KEBS, or EU Food Law."
              },
              {
                icon: BarChart3,
                title: "Know your gaps instantly",
                desc: "A clear compliance score, critical gaps ranked by severity, and copy-paste fixes you can use immediately."
              }
            ].map((step, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-14 h-14 bg-[#E8F4FD] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-[#0071E3]" />
                </div>
                <h3 className="text-heading-sm font-display font-semibold text-[#1d1d1f] mb-2">
                  {i + 1}. {step.title}
                </h3>
                <p className="text-body-sm text-[#6B7280] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real problems founders face (Objection demolition) ── */}
      <section className="section-apple">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-display-xxl font-display font-semibold text-center text-[#1d1d1f] mb-4">
            Failed an audit before? Here's why.
          </h2>
          <p className="text-body text-[#6B7280] text-center mb-12 max-w-2xl mx-auto">
            African food founders lose millions to failed audits. Zareb catches what you'd miss.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle,
                title: "Trying to export to Sainsbury's or Whole Foods?",
                desc: "They require BRCGS certification. Zareb checks if you're ready before you apply."
              },
              {
                icon: AlertTriangle,
                title: "NAFDAC approved \u2260 EU approved",
                desc: "Nigeria's approval doesn't transfer. EU has stricter allergen, labeling, and novel food rules."
              },
              {
                icon: AlertTriangle,
                title: "EU Novel Food rules blocked your last export?",
                desc: "If your product contains baobab, moringa, or other African ingredients — Zareb flags whether they need EU authorization first."
              }
            ].map((pain, i) => (
              <div key={i} className="card border-l-4 border-l-[#D97706]">
                <pain.icon className="w-6 h-6 text-[#D97706] mb-3" />
                <h3 className="font-semibold text-[#1d1d1f] mb-2">{pain.title}</h3>
                <p className="text-body-sm text-[#6B7280]">{pain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is Zareb for? (Authority + specificity) ── */}
      <section className="surface-white section-apple">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-display-xxl font-display font-semibold text-center text-[#1d1d1f] mb-4">
            Built for African food founders
          </h2>
          <p className="text-body text-[#6B7280] text-center mb-12 max-w-2xl mx-auto">
            Whether you're a spice exporter in Accra or a snack brand in Lagos — Zareb speaks your standards.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Snack and beverage brands exporting to UK grocers",
              "Spice and superfood exporters needing EU Novel Food clearance",
              "Processed food manufacturers seeking BRCGS or FSSC 22000",
              "Organic and natural product brands targeting EU organic certification"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <CheckCircle className="w-5 h-5 text-[#16A34A] mt-0.5 shrink-0" />
                <p className="text-body-sm text-[#1d1d1f]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer: Risk reversal + social proof ── */}
      <footer className="surface-white border-t border-[#d6d6d6] py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-semibold text-[#1d1d1f]">
            Free for your first 3 documents. No credit card.
          </p>
          <p className="text-body-sm text-[#858585] mt-2">
            &copy; 2026 Zareb. Built for African food founders, by founders.
          </p>
        </div>
      </footer>
    </div>
  );
}
