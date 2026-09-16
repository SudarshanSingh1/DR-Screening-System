import makeInIndia from '../../assets/MakeInIndia.jpeg';

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

/** Smooth-scroll to an on-page section, accounting for the sticky navbar height */
function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 80;
  const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function Footer() {
  return (
    <footer className="bg-[#090B0F] pt-24 pb-8">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">

        {/* 5-COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">

          {/* COLUMN 1 — BRAND */}
          <div className="flex flex-col items-start pr-4">
            <img
              src={makeInIndia}
              alt="Made in India"
              className="h-14 w-auto object-contain mb-6 mix-blend-screen opacity-90"
            />
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              Explainable AI for diabetic retinopathy screening. Designed for offline-capable clinical workflows and robust human-in-the-loop review.
            </p>
          </div>

          {/* COLUMN 2 — PLATFORM & GOVERNMENT */}
          <div className="flex flex-col">
            <h4 className="text-gray-200 text-xs font-bold tracking-widest uppercase mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium mb-12">
              <li>
                <button
                  onClick={() => scrollTo('workflow-diagram')}
                  className="hover:text-blue-500 transition-colors text-left"
                >
                  Screening Workflow
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('disease-stages')}
                  className="hover:text-blue-500 transition-colors text-left"
                >
                  Disease Stages
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('workflow-diagram')}
                  className="hover:text-blue-500 transition-colors text-left"
                >
                  Doctor Review Dashboard
                </button>
              </li>
            </ul>

            <h4 className="text-gray-200 text-xs font-bold tracking-widest uppercase mb-6">Government Links</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><a href="https://mohfw.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Ministry of Health &amp; Family Welfare</a></li>
              <li><a href="https://www.education.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Ministry of Education</a></li>
              <li><a href="https://sih.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Smart India Hackathon</a></li>
              <li><a href="https://www.aicte-india.org/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">AICTE</a></li>
              <li><a href="https://www.mygov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">MyGov</a></li>
              <li><a href="https://digitalindia.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Digital India</a></li>
              <li><a href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">India.gov.in</a></li>
            </ul>
          </div>

          {/* COLUMN 3 — CLINICAL CAPABILITIES */}
          <div>
            <h4 className="text-gray-200 text-xs font-bold tracking-widest uppercase mb-6">Clinical Capabilities</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              {[
                'Severity Classification',
                'Image Quality Assessment',
                'Grad-CAM Explainability',
                'Lesion Evidence Mapping',
                'Vessel Segmentation',
              ].map((cap) => (
                <li key={cap}>
                  <button
                    onClick={() => scrollTo('workflow-diagram')}
                    className="hover:text-blue-500 transition-colors text-left"
                  >
                    {cap}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 — PROJECT */}
          <div>
            <h4 className="text-gray-200 text-xs font-bold tracking-widest uppercase mb-6">Project</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li>
                <button
                  onClick={() => scrollTo('home')}
                  className="hover:text-blue-500 transition-colors text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('workflow-diagram')}
                  className="hover:text-blue-500 transition-colors text-left"
                >
                  Architecture Documentation
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('workflow-diagram')}
                  className="hover:text-blue-500 transition-colors text-left"
                >
                  Clinical Research
                </button>
              </li>
              <li>
                <a
                  href="https://sih.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-500 transition-colors"
                >
                  Smart India Hackathon
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 5 — MOBILE AND SOCIAL */}
          <div className="flex flex-col">
            <h4 className="text-gray-200 text-xs font-bold tracking-widest uppercase mb-6">View on Mobile</h4>

            {/* QR Code — placeholder until real QR image is provided */}
            <div className="w-28 h-28 border border-slate-700/50 bg-[#0e1219] flex justify-center items-center mb-10 rounded shadow-sm">
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center px-2">
                QR Placeholder
              </span>
            </div>

            <h4 className="text-gray-200 text-xs font-bold tracking-widest uppercase mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-10 h-10 rounded-full bg-[#0e1219] border border-slate-800 flex justify-center items-center hover:bg-[#2663eb] hover:border-[#2663eb] text-gray-400 hover:text-white transition-all duration-300"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-[#0e1219] border border-slate-800 flex justify-center items-center hover:bg-[#2663eb] hover:border-[#2663eb] text-gray-400 hover:text-white transition-all duration-300"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="w-10 h-10 rounded-full bg-[#0e1219] border border-slate-800 flex justify-center items-center hover:bg-[#2663eb] hover:border-[#2663eb] text-gray-400 hover:text-white transition-all duration-300"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-slate-800/60 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
            © 2026 VISION AI PLATFORM. | SMART INDIA HACKATHON.
          </p>
          <p className="text-[10px] text-gray-500 max-w-2xl lg:text-right font-medium uppercase tracking-wider">
            For informational and screening support purposes only. Results must be validated by a certified ophthalmologist.
          </p>
        </div>

      </div>
    </footer>
  );
}
