export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="tag">Built for solo pros</p>
          <h1>Fast booking + deposits that stop no-shows.</h1>
          <p>
            TempoBook keeps your calendar full with a modern booking flow, optional deposits,
            and instant confirmations. Your clients book in under 60 seconds—no account
            required.
          </p>
          <div className="hero-actions">
            <button className="primary">Start free</button>
            <button className="secondary">View demo</button>
          </div>
          <div className="hero-meta">
            <span>Designed for barbers, stylists, nail techs, tattoo artists & cleaners.</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-header">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <div className="hero-card-body">
            <h3>Next opening</h3>
            <p>Thursday, 2:30 PM · Fade + Beard</p>
            <div className="slot-grid">
              {"2:30 PM,3:15 PM,4:00 PM".split(",").map((slot) => (
                <div key={slot} className="slot">
                  {slot}
                </div>
              ))}
            </div>
            <button className="primary full">Confirm with $20 deposit</button>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <h2>Everything you need to run bookings solo</h2>
        <div className="grid">
          {[
            {
              title: "Deposit-ready services",
              body: "Collect upfront deposits with Stripe Checkout and reduce no-shows."
            },
            {
              title: "Calendar-first workflow",
              body: "Smart slot calculations that respect your weekly availability."
            },
            {
              title: "Instant confirmations",
              body: "Text-ready confirmations + email receipts after every booking."
            },
            {
              title: "Subscription controls",
              body: "Free plan for getting started. Pro plan unlocks deposits + unlimited bookings."
            }
          ].map((feature) => (
            <div key={feature.title} className="card">
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="section pricing">
        <h2>Simple pricing for solo professionals</h2>
        <div className="pricing-grid">
          <div className="card">
            <h3>Free</h3>
            <p className="price">$0 / mo</p>
            <ul>
              <li>Limited monthly bookings</li>
              <li>Email confirmations</li>
              <li>Service catalog</li>
            </ul>
          </div>
          <div className="card highlight">
            <h3>Pro</h3>
            <p className="price">$29 / mo</p>
            <ul>
              <li>Unlimited bookings</li>
              <li>Deposits enabled</li>
              <li>Priority support</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
