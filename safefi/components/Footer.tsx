import { COMPANY_NAME, COMPANY_REG_NO } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 pt-12 pb-32 text-sm text-muted sm:px-6 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_2fr]">
        <div>
          <Logo className="text-lg text-text" />
          <p className="mt-3">
            A product of {COMPANY_NAME}
            {COMPANY_REG_NO && ` (${COMPANY_REG_NO})`}.
          </p>
        </div>
        <div className="space-y-3 text-xs leading-relaxed">
          <p>
            <strong className="text-text">About this page.</strong> The journey above is a simplified illustration of how a
            transfer moves. Amounts, rates, block details and the number of validators shown are examples, not live data;
            real networks differ in how many validators take part. Settlement times depend on network conditions.
          </p>
          {/* SIGN-OFF: risk and regulatory wording must be approved by the Compliance Director. */}
          <p>
            Digital assets carry risk, including loss of value. Please read the terms in the app before you transact.
          </p>
          <p>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
