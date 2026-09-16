import { ChevronDown } from 'lucide-react';

const stages = [
  { level: "LEVEL 0", title: "No DR Detected",   desc: "Healthy retina with no signs of diabetic retinopathy.",                       img: "/images/fundus/level0.png", badgeClass: "bg-green-100  text-green-800  border-green-200"  },
  { level: "LEVEL 1", title: "Mild DR",           desc: "Early retinal changes associated with diabetic retinopathy.",                  img: "/images/fundus/level1.png", badgeClass: "bg-blue-100   text-blue-800   border-blue-200"   },
  { level: "LEVEL 2", title: "Moderate DR",       desc: "More pronounced retinal changes requiring closer clinical monitoring.",        img: "/images/fundus/level2.png", badgeClass: "bg-amber-100  text-amber-800  border-amber-200"  },
  { level: "LEVEL 3", title: "Severe DR",         desc: "Advanced retinal changes indicating significant disease progression.",         img: "/images/fundus/level3.png", badgeClass: "bg-orange-100 text-orange-800 border-orange-200" },
  { level: "LEVEL 4", title: "Proliferative DR",  desc: "Advanced diabetic retinopathy with serious risk to vision.",                  img: "/images/fundus/level4.png", badgeClass: "bg-red-100    text-red-800    border-red-200"    },
];

/** Static right-arrow SVG used between stages on desktop */
const RightArrow = () => (
  <svg
    className="w-6 h-6 xl:w-8 xl:h-8 text-clinical-blue opacity-90"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="2"  y1="12" x2="22" y2="12" />
    <polyline points="14 4 22 12 14 20" />
  </svg>
);

/** Static down-arrow SVG used between stages on mobile */
const DownArrow = () => (
  <svg
    className="w-6 h-6 text-clinical-blue opacity-90"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="2"  x2="12" y2="22" />
    <polyline points="5 15 12 22 19 15" />
  </svg>
);

export function DiseaseStagesSection() {
  return (
    <div id="disease-stages" className="bg-white pt-24 pb-8 relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Intro / Challenge Text */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-clinical-blue mb-2">
            THE CHALLENGE WE ADDRESS
          </h2>
          <h3 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl mb-6 uppercase">
            SCALING RETINAL SCREENING IN INDIA
          </h3>
          <p className="text-lg leading-8 text-text-secondary font-medium uppercase tracking-wide">
            77M+ ADULTS IN INDIA LIVE WITH DIABETES. LIMITED SPECIALIST ACCESS AND VARIABLE FUNDUS IMAGE QUALITY CREATE A MAJOR SCREENING GAP.
          </p>
        </div>

        {/* Header Block */}
        <div className="flex flex-col items-center justify-center relative z-20">

          {/* Title Card */}
          <div className="bg-white/80 border border-[#2663eb]/25 rounded-2xl py-8 px-14 shadow-[0_4px_30px_rgba(38,99,235,0.08)] text-center max-w-xl w-full mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-navy mb-3">
              DIABETIC RETINOPATHY STAGES
            </h2>
            <p className="text-xs font-bold text-clinical-blue uppercase tracking-widest">
              AI-BASED DETECTION AND CLASSIFICATION
            </p>
          </div>

          {/* Vertical connector with arrowhead */}
          <div className="flex flex-col items-center">
            <div className="w-px h-10 bg-[#2663eb]/35"></div>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
              <polyline
                points="0,0 8,9 16,0"
                stroke="rgba(38,99,235,0.5)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

        </div>

        {/* Stage Progression Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 w-full relative z-10">
          {stages.map((stage, index) => (
            <div key={index} className="relative flex flex-col items-center w-full">

              {/* Desktop: horizontal top connector line */}
              <div
                className={`hidden lg:block absolute top-0 h-px bg-clinical-blue/40 z-0 ${
                  index === 0
                    ? 'left-1/2 right-0'
                    : index === stages.length - 1
                    ? 'left-0 right-1/2'
                    : 'left-0 right-0'
                }`}
              />

              {/* Desktop: vertical drop line + chevron to circle */}
              <div className="hidden lg:flex absolute top-0 left-1/2 -translate-x-1/2 w-4 h-10 flex-col items-center justify-end z-0">
                <div className="w-px h-full bg-clinical-blue/40"></div>
                <ChevronDown className="w-4 h-4 text-clinical-blue/60 -mt-[6px]" strokeWidth={3} aria-hidden="true" />
              </div>

              {/* Desktop: right-arrow between stages */}
              {index < stages.length - 1 && (
                <div className="hidden lg:flex absolute top-[136px] xl:top-[152px] left-[100%] -translate-x-1/2 -translate-y-1/2 z-30 bg-white p-1 rounded-full shadow-[0_0_10px_white]">
                  <RightArrow />
                </div>
              )}

              {/* Circular retina image */}
              <div className="relative w-full flex justify-center mt-2 lg:mt-10 z-10">
                <div className="w-48 h-48 xl:w-56 xl:h-56 rounded-full border-[6px] border-white shadow-[0_4px_25px_rgba(10,25,47,0.1)] overflow-hidden bg-navy ring-1 ring-border-soft">
                  <img src={stage.img} alt={stage.title} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Stage label, title, description */}
              <div className="text-center flex flex-col items-center px-4 mt-6 z-10">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border mb-3 shadow-sm ${stage.badgeClass}`}>
                  {stage.level}
                </span>
                <h3 className="text-base xl:text-lg font-extrabold text-navy mb-2 leading-tight">
                  {stage.title}
                </h3>
                <p className="text-xs xl:text-sm text-text-secondary font-medium leading-relaxed max-w-[220px]">
                  {stage.desc}
                </p>
              </div>

              {/* Mobile: down-arrow between stages */}
              {index < stages.length - 1 && (
                <div className="lg:hidden flex justify-center mt-8 mb-6 z-10">
                  <DownArrow />
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
