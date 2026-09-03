/**
 * Dialling codes for the phone field.
 *
 * Short by design: the markets the roster actually hears from, not every
 * country on earth. `iso` is what the option shows next to the code, so two
 * countries sharing a dial code (+1, +7) stay tellable apart in the list and
 * as a selected value.
 */
export type CountryCode = {
  /** ISO 3166-1 alpha-2, also the option's value. */
  iso: string;
  dial: string;
  name: string;
};

export const DEFAULT_COUNTRY = "IN";

export const COUNTRY_CODES: readonly CountryCode[] = [
  { iso: "IN", dial: "+91", name: "India" },
  { iso: "US", dial: "+1", name: "United States" },
  { iso: "GB", dial: "+44", name: "United Kingdom" },
  { iso: "AE", dial: "+971", name: "United Arab Emirates" },
  { iso: "SG", dial: "+65", name: "Singapore" },
  { iso: "AU", dial: "+61", name: "Australia" },
  { iso: "CA", dial: "+1", name: "Canada" },
  { iso: "AR", dial: "+54", name: "Argentina" },
  { iso: "AT", dial: "+43", name: "Austria" },
  { iso: "BD", dial: "+880", name: "Bangladesh" },
  { iso: "BE", dial: "+32", name: "Belgium" },
  { iso: "BR", dial: "+55", name: "Brazil" },
  { iso: "CH", dial: "+41", name: "Switzerland" },
  { iso: "CL", dial: "+56", name: "Chile" },
  { iso: "CN", dial: "+86", name: "China" },
  { iso: "CO", dial: "+57", name: "Colombia" },
  { iso: "CZ", dial: "+420", name: "Czechia" },
  { iso: "DE", dial: "+49", name: "Germany" },
  { iso: "DK", dial: "+45", name: "Denmark" },
  { iso: "EG", dial: "+20", name: "Egypt" },
  { iso: "ES", dial: "+34", name: "Spain" },
  { iso: "FI", dial: "+358", name: "Finland" },
  { iso: "FR", dial: "+33", name: "France" },
  { iso: "GR", dial: "+30", name: "Greece" },
  { iso: "HK", dial: "+852", name: "Hong Kong" },
  { iso: "ID", dial: "+62", name: "Indonesia" },
  { iso: "IE", dial: "+353", name: "Ireland" },
  { iso: "IL", dial: "+972", name: "Israel" },
  { iso: "IT", dial: "+39", name: "Italy" },
  { iso: "JP", dial: "+81", name: "Japan" },
  { iso: "KE", dial: "+254", name: "Kenya" },
  { iso: "KR", dial: "+82", name: "South Korea" },
  { iso: "KW", dial: "+965", name: "Kuwait" },
  { iso: "LK", dial: "+94", name: "Sri Lanka" },
  { iso: "MA", dial: "+212", name: "Morocco" },
  { iso: "MX", dial: "+52", name: "Mexico" },
  { iso: "MY", dial: "+60", name: "Malaysia" },
  { iso: "NG", dial: "+234", name: "Nigeria" },
  { iso: "NL", dial: "+31", name: "Netherlands" },
  { iso: "NO", dial: "+47", name: "Norway" },
  { iso: "NP", dial: "+977", name: "Nepal" },
  { iso: "NZ", dial: "+64", name: "New Zealand" },
  { iso: "OM", dial: "+968", name: "Oman" },
  { iso: "PH", dial: "+63", name: "Philippines" },
  { iso: "PK", dial: "+92", name: "Pakistan" },
  { iso: "PL", dial: "+48", name: "Poland" },
  { iso: "PT", dial: "+351", name: "Portugal" },
  { iso: "QA", dial: "+974", name: "Qatar" },
  { iso: "RO", dial: "+40", name: "Romania" },
  { iso: "RU", dial: "+7", name: "Russia" },
  { iso: "SA", dial: "+966", name: "Saudi Arabia" },
  { iso: "SE", dial: "+46", name: "Sweden" },
  { iso: "TH", dial: "+66", name: "Thailand" },
  { iso: "TR", dial: "+90", name: "Türkiye" },
  { iso: "TW", dial: "+886", name: "Taiwan" },
  { iso: "UA", dial: "+380", name: "Ukraine" },
  { iso: "VN", dial: "+84", name: "Vietnam" },
  { iso: "ZA", dial: "+27", name: "South Africa" },
];

export function dialFor(iso: string): string {
  return (
    COUNTRY_CODES.find((c) => c.iso === iso)?.dial ??
    COUNTRY_CODES.find((c) => c.iso === DEFAULT_COUNTRY)!.dial
  );
}
