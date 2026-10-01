/**
 * Site-wide constants. Anything marked SIGN-OFF must be confirmed before launch
 * (see brief §10 and README "Content requiring sign-off").
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://safefiplus.com";
export const SITE_NAME = "SafeFi+";
export const COMPANY_NAME = "Qawwam Empire Sdn Bhd";
// SIGN-OFF: company registration number must be confirmed by the Compliance Director.
export const COMPANY_REG_NO = process.env.NEXT_PUBLIC_COMPANY_REG_NO ?? "";

export const REFERRAL_CODE = "SAFEFIWEB";

// SIGN-OFF: confirm the Play Store package id.
const PLAY_PACKAGE_ID = process.env.NEXT_PUBLIC_PLAY_PACKAGE_ID ?? "com.safefiplus.app";

/** Install Referrer API: Play passes `referrer` through to the installed app. */
export const PLAY_URL =
  `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE_ID}` +
  `&referrer=${encodeURIComponent(`utm_source=web&utm_medium=journey&ref=${REFERRAL_CODE}`)}`;

/** The PWA reads `ref` on first load so users never have to type the code. */
export const PWA_URL = `https://app.safefiplus.com/?ref=${REFERRAL_CODE}&utm_source=web&utm_medium=journey`;

export const SEO = {
  title: "SafeFi+ — Journey of a Transfer | Shariah-compliant USDT ↔ MYR",
  description:
    "Follow one transfer from your phone to settlement. SafeFi+ is a Shariah-compliant app for converting between Malaysian Ringgit and USDT, with eKYC verification and on-chain settlement.",
};
