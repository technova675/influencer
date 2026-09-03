import { COUNTRY_CODES } from "./country-codes";
import { CITIES } from "./taxonomy";

/**
 * Where an applicant is based.
 *
 * Country first, city second, and nothing below that: a state or province only
 * means something inside a handful of countries and is never how a brief is
 * written ("a food creator in Dubai", not "in the Emirate of Dubai"), so the
 * form does not ask for one.
 *
 * The country list is the same set the phone codes come from, so the two
 * dropdowns can never disagree about which countries exist. India leads it
 * because that is where nearly every application comes from; the rest follow
 * alphabetically.
 */
export const DEFAULT_COUNTRY_NAME = "India";

export const COUNTRY_NAMES: readonly string[] = [
  DEFAULT_COUNTRY_NAME,
  ...COUNTRY_CODES.map((c) => c.name)
    .filter((n) => n !== DEFAULT_COUNTRY_NAME)
    .sort((a, b) => a.localeCompare(b)),
];

/**
 * Curated city lists for the markets we actually recruit in. A country absent
 * from here gets a free-text city box instead - a short wrong list is worse
 * than no list, and there is no roster filter riding on these values.
 *
 * India's list is the roster's own `CITIES`, so the join form and the roster
 * filter stay in step.
 */
export const CITIES_BY_COUNTRY: Record<string, readonly string[]> = {
  India: CITIES,
  "United States": [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Miami",
    "San Francisco Bay Area",
    "Seattle",
    "Atlanta",
    "Dallas",
    "Austin",
    "Boston",
    "Washington DC",
    "Other",
  ],
  "United Kingdom": [
    "London",
    "Manchester",
    "Birmingham",
    "Leeds",
    "Glasgow",
    "Edinburgh",
    "Bristol",
    "Other",
  ],
  "United Arab Emirates": [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Other",
  ],
  Singapore: ["Singapore", "Other"],
  Canada: [
    "Toronto",
    "Vancouver",
    "Montreal",
    "Calgary",
    "Ottawa",
    "Edmonton",
    "Other",
  ],
  Australia: [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Gold Coast",
    "Other",
  ],
};

export function citiesFor(country: string): readonly string[] | undefined {
  return CITIES_BY_COUNTRY[country];
}
