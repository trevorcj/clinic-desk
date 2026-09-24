import { Suspense } from "react";

import BookingWizard from "@/components/booking/BookingWizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book",
};

function Book() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="p-6 text-sm text-text-secondary">
            Loading booking step...
          </div>
        }>
        <BookingWizard />
      </Suspense>
    </div>
  );
}

export default Book;
