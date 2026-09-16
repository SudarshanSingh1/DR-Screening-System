import type { ReactNode } from 'react';

/** Context-specific right-panel content passed in by each page */
export interface AuthPanelContent {
  eyebrow?: string;
  heading: string;
  bullets?: string[];
  /** Extra JSX rendered inside the panel below the bullets */
  footer?: ReactNode;
}

interface AuthLayoutProps {
  children: ReactNode;
  /** Content for the left supporting panel (desktop only) */
  panel?: AuthPanelContent;
  /** Widen the form column for pages with more content (signup, identity) */
  wide?: boolean;
}

const defaultPanel: AuthPanelContent = {
  eyebrow: 'VISION AI PLATFORM',
  heading: 'AI-Powered Diabetic Retinopathy Screening',
  bullets: [
    'Multi-model AI pipeline for severity classification',
    'Grad-CAM explainability for transparent diagnosis',
    'Offline-capable clinical workflow support',
    'Doctor-in-the-loop human review validation',
    'Built for India\'s rural screening scale',
  ],
};

const Checkmark = () => (
  <svg className="w-3 h-3 text-blue-300 flex-shrink-0" viewBox="0 0 12 10" fill="none" aria-hidden="true">
    <polyline points="1,5 4,8 11,1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function AuthLayout({ children, panel = defaultPanel, wide = false }: AuthLayoutProps) {
  return (
    /**
     * Root: fills viewport height exactly. flex-col so the header strips
     * height from the top and the two-column body takes the rest.
     * overflow-hidden on root prevents double browser scrollbars.
     */
    <div className="h-screen bg-[#F0F5FF] flex flex-col overflow-hidden">

      {/* ── STICKY TOP BAR ── visible on all breakpoints ── */}
      <header className="flex-shrink-0 w-full bg-white border-b border-[#bfdbfe] px-6 py-3 flex items-center justify-between z-10">
        <a href="/" className="flex items-center gap-2.5" aria-label="Vision AI Platform — home">
          <img src="/VisionAi.png" alt="" className="h-8 w-auto object-contain" aria-hidden="true" />
          <span className="hidden sm:block font-extrabold text-[#1e3a8a] tracking-tight text-sm">
            VISION AI <span className="text-gray-400 font-normal">PLATFORM</span>
          </span>
        </a>
        <p className="text-xs text-[#475569] hidden md:block select-none">
          Early Detection · Brighter Tomorrows
        </p>
      </header>

      {/* ── MAIN AREA: left panel + right form, flex-1 to fill remaining height ── */}
      <div className="flex flex-1 min-h-0">

        {/* ─────── LEFT PANEL — desktop only ─────── */}
        {/*
          overflow-y-auto: panel scrolls independently if viewport is short.
          flex-col with gap between sections so nothing clips on short viewports.
          flex-shrink-0 prevents the panel from collapsing when form is wide.
        */}
        <aside
          className="hidden lg:flex flex-col bg-[#1e3a8a] text-white w-[400px] xl:w-[460px] flex-shrink-0 overflow-y-auto"
          aria-label="Vision AI platform information"
        >
          {/* Scrollable inner container with comfortable padding */}
          <div className="flex flex-col min-h-full px-10 py-12">

            {/* Eyebrow + heading */}
            <div className="mb-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-300 mb-3">
                {panel.eyebrow ?? 'VISION AI PLATFORM'}
              </p>
              <h2 className="text-2xl xl:text-[1.65rem] font-extrabold leading-tight text-white">
                {panel.heading}
              </h2>
            </div>

            {/* Feature bullets */}
            {panel.bullets && panel.bullets.length > 0 && (
              <ul className="space-y-3.5 mb-8" aria-label="Platform features">
                {panel.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-blue-100 leading-relaxed">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-500/25 border border-blue-400/35 flex items-center justify-center flex-shrink-0">
                      <Checkmark />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {panel.footer && (
              <div className="mb-8">{panel.footer}</div>
            )}

            {/* Spacer pushes image + tagline to the bottom */}
            <div className="flex-1" />

            {/* Fundus image — real project asset */}
            <div className="rounded-xl overflow-hidden border border-blue-700/40 opacity-55">
              <img
                src="/images/fundus/level2.png"
                alt="Diabetic retinopathy fundus image used in AI analysis"
                className="w-full h-36 object-cover"
              />
              <p className="text-[9px] text-blue-300 text-center py-2 tracking-[0.18em] uppercase">
                Fundus Image · AI Severity Analysis
              </p>
            </div>

            {/* Bottom tagline */}
            <p className="text-[9px] text-blue-500 uppercase tracking-[0.2em] mt-5 select-none">
              PREVENT · DETECT · EMPOWER
            </p>

          </div>
        </aside>

        {/* ─────── RIGHT SIDE — scrollable form area ─────── */}
        {/*
          overflow-y-auto: only this column scrolls, sidebar stays fixed.
          flex flex-col items-center so short pages are vertically centred.
        */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#F0F5FF]">
          <div className="flex flex-col items-center min-h-full py-10 px-4 sm:px-8">

            <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} flex flex-col`}>

              {/* Form card */}
              <div className="bg-white rounded-2xl border border-[#bfdbfe] shadow-[0_4px_32px_rgba(38,99,235,0.08)] p-7 sm:p-9">
                {children}
              </div>

              {/* Security note */}
              <p className="text-center text-xs text-[#64748b] mt-5">
                🔒 Your data is secure and used only for healthcare purposes.
              </p>

              {/* Footer links */}
              <div className="flex items-center justify-center gap-1 mt-2 pb-8" aria-label="Legal links">
                {['Terms', 'Privacy', 'Help'].map((item, i, arr) => (
                  <span key={item} className="flex items-center">
                    <span className="text-xs text-[#64748b] px-2 cursor-pointer hover:text-[#2663eb] transition-colors">
                      {item}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-gray-300 text-xs select-none" aria-hidden="true">|</span>
                    )}
                  </span>
                ))}
              </div>

            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
