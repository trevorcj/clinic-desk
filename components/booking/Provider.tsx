"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Select } from "../ui/Select";
import { BookingFormData } from "./BookingWizard";

const defaultProviders = [
  {
    value: "provider-001",
    label: "Dr. Jane Smith (General Practitioner)",
  },
  {
    value: "provider-002",
    label: "Dr. Alex Jones (Cardiologist)",
  },
  {
    value: "provider-003",
    label: "Dr. Michael Chen (Psychiatrist)",
  },
  {
    value: "provider-004",
    label: "Dr. Sarah Patel (Pediatrician)",
  },
  {
    value: "provider-005",
    label: "Dr. Robert Johnson (Dermatologist)",
  },
  {
    value: "provider-006",
    label: "Dr. Emily Taylor (Endocrinologist)",
  },
];

function Provider() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingFormData>();
  const [providerOptions, setProviderOptions] = useState(defaultProviders);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/providers")
      .then((res) => res.json())
      .then((res) => {
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setProviderOptions(
            res.data.map((p: { id: string; name: string; specialty: string }) => ({
              value: p.id,
              label: `${p.name} (${p.specialty})`,
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Select
      label="Preferred provider"
      placeholder="Select a provider"
      options={providerOptions}
      error={errors.providerId?.message}
      {...register("providerId")}
    />
  );
}

export default Provider;
