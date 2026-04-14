const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Up to 50 notes",
      "2 notebooks",
      "Basic search",
      "1 shared note",
      "Rich text editor",
      "Web access",
    ],
    cta: "Get started free",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$8",
    period: "per month",
    features: [
      "Unlimited notes",
      "Unlimited notebooks",
      "Full-text search",
      "Unlimited sharing",
      "Evernote import",
      "Rich text editor",
      "Priority support",
      "Advanced export",
    ],
    cta: "Start free trial",
    href: "/register",
    highlight: true,
  },
];

export default function PricingSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Simple pricing
        </h2>
        <p className="text-gray-500 text-center mb-12 text-lg">
          Start simply, upgrade when you&apos;re ready.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-xl border ${
                plan.highlight
                  ? "border-evernote-green bg-green-50 shadow-lg"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-semibold text-evernote-green uppercase tracking-wide mb-2">
                  POPULAR
                </div>
              )}
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {plan.name}
              </div>
              <div className="mb-1">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 my-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-evernote-green">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                className={`block text-center py-2 px-4 rounded-lg text-sm font-medium transition ${
                  plan.highlight
                    ? "bg-evernote-green text-white hover:bg-green-600"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
