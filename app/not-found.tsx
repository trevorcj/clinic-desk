import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo-dark.svg";

export default function NotFound() {
  return (
    <>
      <Image
        src={Logo}
        width={169}
        height={24}
        alt="ClinicDesk Logo"
        className="h-5 w-auto mt-10"
      />
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <h1 className="text-3xl font-medium tracking-tight text-text-primary">
          404
        </h1>

        <Link
          href="/appointments"
          className="mt-6 inline-flex items-center px-6 py-2.5 font-medium bg-black text-white rounded-full hover:bg-black/90 transition-colors">
          Return to Appointments
        </Link>
      </div>
    </>
  );
}
