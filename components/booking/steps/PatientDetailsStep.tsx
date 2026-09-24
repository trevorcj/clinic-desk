import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { BookingFormData } from "../BookingWizard";

function PatientDetailsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingFormData>();

  return (
    <section className="max-w-3xl mx-auto flex flex-col items-center justify-center">
      <div className="text-center">
        <h2>Patient details</h2>
        <p className="text-text-secondary mt-2">
          Let&apos;s get to know you. Provide your details to continue
        </p>
      </div>

      <div className="mt-16 w-full max-w-md flex flex-col items-stretch space-y-6">
        <Input
          {...register("firstName")}
          label="First name"
          type="text"
          placeholder="John"
          error={errors.firstName?.message}
        />
        <Input
          {...register("lastName")}
          label="Last name"
          type="text"
          placeholder="Doe"
          error={errors.lastName?.message}
        />
        <Input
          {...register("dateOfBirth")}
          label="Date of birth"
          type="date"
          placeholder="21/09/2000"
          error={errors.dateOfBirth?.message}
        />
        <Input
          {...register("email")}
          label="Email address"
          type="email"
          placeholder="name@example.com"
          error={errors.email?.message}
        />
        <Input
          {...register("phone")}
          label="Phone number"
          mask="+1 ___ ___ ____"
          placeholder="+1 333 333-3333"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          error={errors.phone?.message}
        />
      </div>
    </section>
  );
}

export default PatientDetailsStep;
