const priceBreakdown = {
  basePrice: document.getElementById("basePrice"),
  processingFee: document.getElementById("processingFee"),
  totalPrice: document.getElementById("totalPrice")
};

const formatCurrency = (amountCents) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amountCents / 100);

const loadPricing = async () => {
  const response = await fetch("/api/price");
  const data = await response.json();

  priceBreakdown.basePrice.textContent = formatCurrency(data.basePriceCents);
  priceBreakdown.processingFee.textContent = formatCurrency(
    data.processingFeeCents
  );
  priceBreakdown.totalPrice.textContent = formatCurrency(data.totalCents);
};

const handleCheckout = async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.email.value.trim();

  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ customerEmail: email || undefined })
  });

  if (!response.ok) {
    alert("Unable to start checkout. Please try again.");
    return;
  }

  const data = await response.json();
  if (data.url) {
    window.location.assign(data.url);
  }
};

loadPricing();

document
  .getElementById("checkoutForm")
  .addEventListener("submit", handleCheckout);
