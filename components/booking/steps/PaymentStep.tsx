"use client";

import PaymentMethod from "../PaymentMethod";

function PaymentStep() {
  return (
    <section className="max-w-3xl mx-auto flex flex-col items-center justify-center">
      <div className="text-center">
        <h2>Select payment method</h2>
        <p className="text-text-secondary mt-2 sm:max-w-xl">
          Choose how you would like to pay for your appointment.
        </p>
      </div>

      <div className="mt-16 w-full max-w-md flex flex-col items-stretch space-y-10">
        <PaymentMethod />
      </div>
    </section>
  );
}

export default PaymentStep;
