import { Landing } from "@/components/landing/landing";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale } from "@/i18n/config";
import { IS_LANDING } from "@/lib/env";
import { RedirectToLocale } from "./redirect-to-locale";

export default async function IndexPage() {
  if (IS_LANDING) {
    const dict = await getDictionary(defaultLocale);
    return <Landing dict={dict} />;
  }
  return <RedirectToLocale />;
}
