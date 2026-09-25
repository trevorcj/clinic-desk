import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Patients",
};

function Patients() {
  return (
    <div>
      <Suspense fallback={<p>Loading patients...</p>}>
        <h2>Patients</h2>
      </Suspense>
    </div>
  );
}

export default Patients;
