import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import {
  Shield, Upload, FileSearch, CheckCircle, ArrowRight,
  AlertTriangle, Zap, BarChart3, Camera, Sparkles
} from "lucide-react";

export default function Landing() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-cream-200">
      {/* ── Header: Warm, minimal nav ── */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand to-brand-800 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-display font-bold text-lg leading-none">Z</span>
            </div>
            <span className="font-display font-bold text-stone-900 text-xl">Zareb</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors px-4 py-2"
            >
              {t("auth.signInBtn")}
            </Link>
            <Link to="/register" className="btn-primary text-sm !py-2.5 !px-6">
              {t("auth.getStarted")}
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
            {t("landing.tagline")}
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-stone-900 text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-8 max-w-5xl mx-auto tracking-tight">
            {t("landing.headline")}{' '}
            <span className="text-brand bg-brand-50/50 px-3 py-1 rounded-2xl">{t("landing.headlineHighlight")}</span>
          </h1>

          {/* Subhead */}
          <p className="text-lg md:text-xl text-stone-500 max-w-3xl mx-auto mb-12 leading-relaxed">
            {t("landing.subhead")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base inline-flex items-center gap-2 !py-4 !px-10 shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/25 transition-shadow">
              {t("landing.ctaFree")} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="btn-secondary text-base inline-flex items-center gap-2 !py-4 !px-10">
              <Camera className="w-5 h-5" /> {t("landing.ctaScan")}
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
            <span className="font-display text-brand font-semibold text-sm tracking-widest uppercase">{t("landing.howItWorks")}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mt-3 mb-4">
              {t("landing.howItWorksSub")}
            </h2>
            <p className="text-lg text-stone-500 max-w-2xl mx-auto">
              {t("landing.howItWorksDesc")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Camera,
                title: t("landing.step1Title"),
                desc: t("landing.step1Desc"),
                step: "01"
              },
              {
                icon: Zap,
                title: t("landing.step2Title"),
                desc: t("landing.step2Desc"),
                step: "02"
              },
              {
                icon: BarChart3,
                title: t("landing.step3Title"),
                desc: t("landing.step3Desc"),
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
            <span className="font-display text-brand font-semibold text-sm tracking-widest uppercase">{t("landing.whyMatters")}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mt-3 mb-4">
              {t("landing.whyMattersTitle")}
            </h2>
            <p className="text-lg text-stone-500 max-w-2xl mx-auto">
              {t("landing.whyMattersDesc")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: AlertTriangle,
                title: t("landing.pain1Title"),
                desc: t("landing.pain1Desc"),
                color: "warning"
              },
              {
                icon: AlertTriangle,
                title: t("landing.pain2Title"),
                desc: t("landing.pain2Desc"),
                color: "danger"
              },
              {
                icon: AlertTriangle,
                title: t("landing.pain3Title"),
                desc: t("landing.pain3Desc"),
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
            <span className="font-display text-brand font-semibold text-sm tracking-widest uppercase">{t("landing.whoFor")}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mt-3 mb-4">
              {t("landing.whoForTitle")}
            </h2>
            <p className="text-lg text-stone-500 max-w-2xl mx-auto">
              {t("landing.whoForDesc")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              t("landing.whoForItem1"),
              t("landing.whoForItem2"),
              t("landing.whoForItem3"),
              t("landing.whoForItem4")
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
            {t("landing.ctaReady")}
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            {t("landing.freeCheck")}
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-3 bg-white text-brand-700 font-semibold py-4 px-10 rounded-pill text-lg hover:bg-stone-50 transition-all duration-200 shadow-xl shadow-black/10 hover:shadow-2xl"
          >
            {t("landing.ctaFinal")} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm leading-none">Z</span>
              </div>
              <span className="font-display font-bold text-white text-lg">Zareb</span>
            </div>
            <div className="text-center md:text-right">
              <p className="font-medium text-white text-sm mb-1">
                {t("landing.freeCheck")}
              </p>
              <p className="text-sm text-stone-500">
                &copy; 2026 Zareb. {t("landing.footer")}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
