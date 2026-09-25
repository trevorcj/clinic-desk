import Image from "next/image";
import Link from "next/link";
import LogoDark from "@/public/pill.jpg";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-center">
        <Image
          src="./logo-dark.svg"
          width={169}
          height={24}
          alt="ClinicDesk Logo"
          className="h-5 w-auto"
        />
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-40 pb-24 text-center flex flex-col items-center">
        <span className="inline-flex items-center align-middle ml-6 mx-1 -mt-1 sm:-mt-2">
          <span className="relative w-20 h-11 w-24 h-12 rounded-full overflow-hidden inline-block ring-1 ring-black/5">
            <Image
              src={LogoDark}
              alt="Doctor or clinical setting"
              fill
              className="object-cover"
              priority
            />
          </span>
        </span>
        <br />
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-text-primary leading-[1.15] sm:leading-[1.15]">
          Book your next appointment with ease
        </h1>

        <p className="mt-6 text-base md:text-lg text-text-secondary max-w-xl leading-relaxed font-normal">
          Get the care you need, when you need it. Our trusted healthcare
          professionals are here to help.
        </p>

        <div className="mt-8 flex gap-3 items-center wrap">
          <Link
            href="/book"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-primary hover:bg-primary/95 active:bg-primary/85 rounded-full transition-all duration-200 whitespace-nowrap">
            Book appointment
          </Link>
          <Link
            href="/appointments"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-text-primary bg-transparent rounded-full transition-all duration-200 whitespace-nowrap border border-border/30">
            View Appointments
          </Link>
        </div>
      </section>
    </main>
  );
}
