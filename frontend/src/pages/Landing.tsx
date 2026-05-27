import { Link } from "react-router-dom";
import EnvHeroBackdrop from "../components/EnvHeroBackdrop";
import PillButton from "../components/PillButton";

/** Break out of AppShell max-width so hero image is full viewport width. */
const FULL_BLEED = "relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw]";

const steps = [
  {
    label: "Upload CSV or sync travel JSON",
    icon: (
      <svg className="h-8 w-8 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    label: "Raw data preserved immutably",
    icon: (
      <svg className="h-8 w-8 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: "Normalize to Scope 1 / 2 / 3",
    icon: (
      <svg className="h-8 w-8 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L10.5 5.25 14.571 9.75M6.429 14.25L10.5 18.75 14.571 14.25M4.5 12h15" />
      </svg>
    ),
  },
  {
    label: "Review, approve, lock for audit",
    icon: (
      <svg className="h-8 w-8 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const sources = [
  {
    name: "SAP Procurement",
    desc: "Budget and procurement export fields (Ariba-style accounting columns).",
    href: "https://help.sap.com/doc/6c6aa6afc1da10149a5eec27ae2c573b/2605/en-US/ProcurementAdmin.pdf",
    icon: "Scope 1 & 3",
  },
  {
    name: "Utility electricity",
    desc: "Green Button / Download My Data billing export patterns.",
    href: "https://docs.oracle.com/en/industries/utilities/digital-self-service/energy-management-overview/green-button-downloadmydata.html#GUID-51913E15-170B-4856-A8F8-4C74A8321134",
    icon: "Scope 2",
  },
  {
    name: "Corporate travel",
    desc: "SAP Concur itinerary API structure (air, hotel, ground).",
    href: "https://github.com/concur/developer.concur.com/blob/preview/src/api-reference/travel/itinerary/itinerary.markdown",
    icon: "Scope 3",
  },
];

function StepArrow() {
  return (
    <span className="hidden shrink-0 items-center justify-center text-emerald-400 md:flex" aria-hidden>
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </span>
  );
}

export default function Landing() {
  return (
    <div className={`${FULL_BLEED} overflow-x-hidden`}>
      {/* Full-screen cover: image fills viewport; text sits on top */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pb-36 pt-24 text-center md:pt-28">
        <EnvHeroBackdrop />

        <div className="relative z-10 mx-auto max-w-4xl px-2">
          <h1 className="font-serif text-4xl leading-[1.08] text-slate-900 drop-shadow-sm md:text-6xl">
            Ingest. Normalize. Audit.
            <span className="mt-2 block text-emerald-800">ESG activity data</span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-slate-800/95 md:max-w-lg md:text-lg">
            Breathe ESG turns messy SAP, utility, and travel feeds into a canonical activity model.
            Analysts resolve validation issues before records are locked for external audit.
          </p>

          <div className="mt-10 flex justify-center">
            <Link to="/login">
              <PillButton className="!bg-emerald-900 !px-10 !py-3 shadow-lg hover:!bg-emerald-800">
                Analyst sign in
              </PillButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Content below the cover */}
      <div className="relative z-10 bg-white">
        <section className="relative mx-auto max-w-5xl px-6 -mt-20 pb-16 md:-mt-28">
          <div className="rounded-t-[2rem] rounded-b-3xl border border-emerald-100/80 bg-white p-8 shadow-xl md:p-10">
            <div className="text-center">
              <h2 className="font-serif text-2xl text-slate-900 md:text-3xl">How it works</h2>
              <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-emerald-500" />
            </div>

            <div className="mt-10 flex flex-col items-stretch gap-6 md:flex-row md:items-center md:justify-between">
              {steps.map((step, i) => (
                <div key={step.label} className="flex flex-1 items-center gap-2 md:gap-0">
                  <div className="flex flex-1 flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50">
                      {step.icon}
                    </div>
                    <p className="mt-4 text-sm leading-snug text-slate-700">{step.label}</p>
                  </div>
                  {i < steps.length - 1 && <StepArrow />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="text-center font-serif text-2xl text-slate-900">Research-backed sources</h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Ingest SAP, utility, and travel data shaped like real enterprise exports.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {sources.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-emerald-100 bg-white p-5 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  {s.icon}
                </span>
                <h3 className="mt-2 font-medium text-slate-900 group-hover:text-emerald-800">{s.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.desc}</p>
                <span className="mt-3 inline-block text-xs font-medium text-emerald-800">
                  View reference →
                </span>
              </a>
            ))}
          </div>
        </section>

        <p className="pb-10 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-700/50">
          Breathe ESG · Cleaner data for a cleaner footprint
        </p>
      </div>
    </div>
  );
}
