import workflowDiagram from '../../assets/workflow-diagram.png';

export function WorkflowSection() {
  return (
    <div id="workflow-diagram" className="bg-white pb-24 border-b border-border-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading Card */}
        <div className="flex flex-col items-center pt-24 mb-0">

          {/* Outlined heading box */}
          <div className="bg-white/80 border border-[#2663eb]/25 rounded-2xl py-10 px-10 sm:px-16 shadow-[0_4px_30px_rgba(38,99,235,0.08)] text-center max-w-2xl w-full mx-auto">
            <p className="text-xs font-extrabold uppercase tracking-widest text-clinical-blue mb-4">
              CLINICAL REVIEW WORKFLOW
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy uppercase mb-5">
              DOCTOR-IN-THE-LOOP VALIDATION
            </h2>
            <p className="text-base text-text-secondary font-medium leading-relaxed max-w-lg mx-auto">
              AI insights are supported by explainable evidence, allowing clinicians to review, validate, and confirm screening results.
            </p>
          </div>

          {/* Vertical connector + arrowhead */}
          <div className="flex flex-col items-center mt-0 mb-10">
            <div className="w-px h-12 bg-[#2663eb]/35"></div>
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

        {/* Workflow Image Asset — unchanged */}
        <div className="w-full flex justify-center items-center">
          <img
            src={workflowDiagram}
            alt="Vision AI Clinical Workflow Architecture"
            className="w-full max-w-6xl h-auto object-contain rounded-xl shadow-[0_10px_40px_rgba(10,25,47,0.08)] border border-border-soft"
          />
        </div>

      </div>
    </div>
  );
}
