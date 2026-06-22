import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { COMPANY_ADDRESS, COMPANY_EMAIL, COMPANY_PHONE, IMG } from "@/lib/constants";
import { FadeIn } from "@/components/motion/FadeIn";

export default function ContactPage() {
  return (
    <div className="container-page py-14">
      <FadeIn>
        <h1 className="text-center text-3xl font-bold text-brand-900">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-brand-700">
          Have questions or need assistance? Reach out to us!
        </p>
      </FadeIn>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <FadeIn className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-900">Contact Information</h2>
          <div className="flex flex-col gap-4 text-sm text-brand-700">
            <div className="flex items-center gap-3 transition-transform hover:translate-x-1">
              <Image src={`${IMG}/address.webp`} alt="" width={28} height={28} />
              <span>{COMPANY_ADDRESS}</span>
            </div>
            <div className="flex items-center gap-3 transition-transform hover:translate-x-1">
              <Image src={`${IMG}/call.webp`} alt="" width={28} height={28} />
              <span>{COMPANY_PHONE}</span>
            </div>
            <div className="flex items-center gap-3 transition-transform hover:translate-x-1">
              <Image src={`${IMG}/email-icon.webp`} alt="" width={28} height={28} />
              <span>{COMPANY_EMAIL}</span>
            </div>
          </div>

          <h2 className="mb-3 mt-8 text-lg font-semibold text-brand-900">Follow Us</h2>
          <div className="flex gap-3">
            <Image src={`${IMG}/facebook.avif`} alt="Facebook" width={28} height={28} className="transition-transform hover:-translate-y-1 hover:scale-110" />
            <Image src={`${IMG}/insta.avif`} alt="Instagram" width={28} height={28} className="transition-transform hover:-translate-y-1 hover:scale-110" />
            <Image src={`${IMG}/linkedin.avif`} alt="LinkedIn" width={28} height={28} className="transition-transform hover:-translate-y-1 hover:scale-110" />
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <ContactForm />
        </FadeIn>
      </div>
    </div>
  );
}
