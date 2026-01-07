import { calculateSlots } from "../../lib/availability";
import { supabaseServer } from "../../lib/supabase";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default async function BookingPage({
  params,
  searchParams
}: {
  params: { business_slug: string };
  searchParams?: { date?: string; service?: string };
}) {
  const supabase = supabaseServer();
  const date = searchParams?.date ? new Date(searchParams.date) : new Date();

  const { data: business } = await supabase
    .from("businesses")
    .select("id,business_name,timezone,currency,slug")
    .eq("slug", params.business_slug)
    .single();

  if (!business) {
    return (
      <main className="section">
        <h1>Business not found</h1>
        <p>Check the booking link and try again.</p>
      </main>
    );
  }

  const { data: services } = await supabase
    .from("services")
    .select("id,name,duration_minutes,price_cents,requires_deposit,deposit_cents")
    .eq("business_id", business.id)
    .eq("active", true);

  const selectedService = services?.find((service) => service.id === searchParams?.service);

  const { data: availability } = await supabase
    .from("availability")
    .select("weekday,start_time,end_time")
    .eq("business_id", business.id);

  const { data: existing } = await supabase
    .from("bookings")
    .select("start_time,end_time")
    .eq("business_id", business.id)
    .gte("start_time", `${formatDate(date)}T00:00:00`)
    .lte("start_time", `${formatDate(date)}T23:59:59`)
    .in("status", ["pending", "confirmed", "completed"]);

  const slots = selectedService && availability
    ? calculateSlots({
        date,
        durationMinutes: selectedService.duration_minutes,
        availability,
        existing: existing ?? []
      })
    : [];

  return (
    <main className="booking">
      <section className="booking-hero">
        <div>
          <p className="eyebrow">Booking</p>
          <h1>{business.business_name}</h1>
          <p>Choose a service and time. Deposits are held securely with Stripe.</p>
        </div>
      </section>

      <section className="booking-grid">
        <div className="card">
          <h3>1. Select service</h3>
          <div className="list">
            {services?.map((service) => (
              <a
                key={service.id}
                className={`list-item selectable ${
                  service.id === selectedService?.id ? "selected" : ""
                }`}
                href={`/book/${business.slug}?service=${service.id}&date=${formatDate(date)}`}
              >
                <div>
                  <strong>{service.name}</strong>
                  <p>
                    {(service.price_cents / 100).toFixed(2)} {business.currency} · {service.duration_minutes} min
                  </p>
                </div>
                <span>
                  {service.requires_deposit
                    ? `Deposit ${(service.deposit_cents ?? 0) / 100} ${business.currency}`
                    : "No deposit"}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>2. Pick a time</h3>
          <p className="muted">Available slots for {formatDate(date)} ({business.timezone}).</p>
          <div className="slot-grid">
            {slots.length === 0 && <p className="muted">Select a service to see slots.</p>}
            {slots.map((slot) => (
              <label key={slot.label} className="slot selectable">
                <input
                  type="radio"
                  name="slot"
                  value={`${slot.start.toISOString()}|${slot.end.toISOString()}`}
                  form="booking-form"
                  required
                />
                {slot.label}
              </label>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>3. Customer info</h3>
          <form id="booking-form" action="/api/bookings" method="post" className="form">
            <input type="hidden" name="business_id" value={business.id} />
            <input type="hidden" name="service_id" value={selectedService?.id ?? ""} />
            <label>
              Name
              <input name="customer_name" placeholder="Your name" required />
            </label>
            <label>
              Email
              <input name="customer_email" type="email" placeholder="you@email.com" required />
            </label>
            <button className="primary full" type="submit">
              {selectedService?.requires_deposit ? "Continue to deposit" : "Confirm booking"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
