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
        <h1 className="text-[62px] sm:text-6xl md:text-7xl font-medium tracking-tight text-text-primary leading-[1.15] sm:leading-[1.15]">
          Book your next <br className="hidden sm:inline" />
          <span>appointment </span>
          <span className="inline-flex items-center align-middle mx-1 -mt-1 sm:-mt-2">
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
          <span> with ease</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-xl leading-relaxed font-normal">
          Get the care you need, when you need it. Our trusted healthcare
          professionals are here to help.
        </p>

        <div className="mt-8">
          <Link
            href="/book"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-primary hover:bg-primary/95 active:bg-primary/85 rounded-full transition-all duration-200 ">
            Book appointment
          </Link>
        </div>
      </section>
    </main>
  );
}
