import { Link } from "react-router-dom";
import EnvHeroBackdrop from "../components/EnvHeroBackdrop";
import PillButton from "../components/PillButton";

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

export default function Landing() {
  return (
    <div className="relative -mx-6 min-h-[85vh] overflow-hidden">
      <EnvHeroBackdrop />

      <section className="relative flex flex-col items-center px-6 pb-16 pt-20 text-center">
        <span className="rounded-full border border-emerald-200/80 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-widest text-emerald-800 backdrop-blur">
          Enterprise sustainability operations
        </span>
        <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.08] text-brand-950 md:text-6xl">
          Ingest. Normalize. Audit.
          <span className="block text-emerald-800">ESG activity data</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
          Breathe ESG turns messy SAP, utility, and travel feeds into a canonical activity model.
          Analysts resolve validation issues before records are locked for external audit.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/login">
            <PillButton className="!bg-emerald-900 hover:!bg-emerald-800">Analyst sign in</PillButton>
          </Link>
          <Link to="/login">
            <PillButton variant="secondary">Open workspace</PillButton>
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-3xl border border-emerald-100/80 bg-white/75 p-8 shadow-sm backdrop-blur">
          <h2 className="text-center font-serif text-2xl text-brand-950">How it works</h2>
          <ol className="mt-6 grid gap-4 text-left md:grid-cols-4">
            {[
              "Upload CSV or sync travel JSON",
              "Raw data preserved immutably",
              "Normalize to Scope 1 / 2 / 3",
              "Review, approve, lock for audit",
            ].map((step, i) => (
              <li key={step} className="rounded-xl border border-slate-100 bg-white/80 p-4">
                <span className="text-xs font-bold text-emerald-700">Step {i + 1}</span>
                <p className="mt-2 text-sm text-slate-700">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 pb-20">
        <h2 className="text-center font-serif text-2xl text-brand-950">Research-backed sources</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Upload your own files if they use the same column layout as the samples in the /samples folder.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {sources.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-emerald-100 bg-white/80 p-5 text-left shadow-sm backdrop-blur transition hover:border-emerald-400 hover:shadow-md"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                {s.icon}
              </span>
              <h3 className="mt-2 font-medium text-brand-950 group-hover:text-emerald-800">{s.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.desc}</p>
              <span className="mt-3 inline-block text-xs font-medium text-brand-600">
                View reference
              </span>
            </a>
          ))}
        </div>
      </section>

      <p className="relative pb-12 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-700/60">
        Breathe ESG · Cleaner data for a cleaner footprint
      </p>
    </div>
  );
}
