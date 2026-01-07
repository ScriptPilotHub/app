const sampleBookings = [
  {
    id: "bk_103",
    customer: "Jade Moore",
    service: "Full set nails",
    time: "Today · 2:30 PM",
    status: "Confirmed"
  },
  {
    id: "bk_104",
    customer: "Darren Hill",
    service: "Fade + beard",
    time: "Tomorrow · 11:00 AM",
    status: "Pending"
  }
];

export default function DashboardPage() {
  return (
    <main className="dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Owner dashboard</p>
          <h1>Manage bookings, services, and deposits in one place.</h1>
          <p>
            Connect your Stripe subscription, set availability, and keep your calendar full with
            automated confirmations.
          </p>
        </div>
        <button className="primary">Upgrade to Pro</button>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <h3>Upcoming bookings</h3>
          <div className="list">
            {sampleBookings.map((booking) => (
              <div key={booking.id} className="list-item">
                <div>
                  <strong>{booking.customer}</strong>
                  <p>{booking.service}</p>
                </div>
                <div className="list-meta">
                  <span>{booking.time}</span>
                  <span className="pill">{booking.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Weekly availability</h3>
          <p>Set your working hours for each day. Sync with real-time booking slots.</p>
          <div className="availability">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
              <div key={day} className="availability-row">
                <span>{day}</span>
                <span>10:00 AM – 6:00 PM</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Services</h3>
          <p>Manage pricing, durations, and deposits.</p>
          <ul className="service-list">
            <li>
              <span>Signature fade</span>
              <span>$35 · 45 min · $15 deposit</span>
            </li>
            <li>
              <span>Deluxe color</span>
              <span>$120 · 120 min · No deposit</span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
