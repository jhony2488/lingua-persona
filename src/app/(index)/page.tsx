import { Landing } from "@/components/landing/landing";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale } from "@/i18n/config";
import { RedirectToLocale } from "./redirect-to-locale";

export default async function IndexPage() {
  if (process.env.LANDING_PAGE === "1") {
    const dict = await getDictionary(defaultLocale);
    return <Landing dict={dict} />;
  }
  return <RedirectToLocale />;
}
