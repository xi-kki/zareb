import { Link } from "react-router-dom";
import { Shield, Upload, FileSearch, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-[#111827] text-xl">Nuri</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Shield className="w-4 h-4" />
          For African food founders exporting to EU/UK
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] leading-tight mb-6 max-w-4xl mx-auto">
          Know your compliance gaps <br />
          <span className="text-primary">before the auditor does.</span>
        </h1>
        <p className="text-lg md:text-xl text-[#6B7280] max-w-3xl mx-auto mb-10 leading-relaxed">
          Nuri reads your HACCP plans, ingredient lists, and food labels — then tells you
          exactly what's missing for EU/UK export approval.
        </p>
        <Link to="/register" className="btn-primary text-lg inline-flex items-center gap-2 px-8 py-4">
          Check My Documents Free <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="text-sm text-[#6B7280] mt-4">Used by food founders in Lagos, Accra & Nairobi</p>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#111827] mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Upload, title: "Upload", desc: "Upload your compliance docs — PDF or Word. Labels, HACCP plans, audit reports." },
              { icon: FileSearch, title: "Analyze", desc: "Nuri scans against HACCP, FSMA, SQF, BRCGS, or your target standard." },
              { icon: CheckCircle, title: "Get Report", desc: "Score, critical gaps, copy-paste fixes — in 30 seconds." },
            ].map((step, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-[#111827] mb-2">Step {i + 1}: {step.title}</h3>
                <p className="text-[#6B7280]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#111827] mb-4">Audit failed? Find out why before it costs you</h2>
          <p className="text-[#6B7280] text-center mb-12 max-w-2xl mx-auto">
            African food founders lose millions to failed audits. Here's what Nuri catches.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, title: "Trying to export to Sainsbury's or Whole Foods?", desc: "They require BRCGS. Nuri checks if you're ready." },
              { icon: AlertTriangle, title: "NAFDAC approved ≠ EU approved", desc: "Nigeria's approval doesn't transfer. Know the gaps." },
              { icon: AlertTriangle, title: "EU Novel Food rules blocked your last export?", desc: "Nuri flags ingredients needing authorization before you ship." },
            ].map((pain, i) => (
              <div key={i} className="card border-l-4 border-l-warning">
                <pain.icon className="w-6 h-6 text-warning mb-3" />
                <h3 className="font-semibold text-[#111827] mb-2">{pain.title}</h3>
                <p className="text-sm text-[#6B7280]">{pain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-[#6B7280] font-medium">Free for first 3 documents. No credit card.</p>
          <p className="text-sm text-[#6B7280] mt-2">© 2026 Nuri. Built for African food founders.</p>
        </div>
      </footer>
    </div>
  );
}
