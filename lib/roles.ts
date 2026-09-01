import type { TalentType } from "./taxonomy";

/**
 * One entry per public role, and the single source of truth for everything the
 * visitor-facing side of the site says to that role.
 *
 * The site is split by role on purpose. Somebody who came here to be booked as
 * a model has no reason to read about follower tiers, and an influencer has no
 * reason to be shown measurement fields - so each role gets its own landing
 * page, its own navigation and its own copy, and never sees the others'. The
 * only page that shows all three is the brand page, because a brand is hiring
 * across all of them.
 */
export type RoleId = "influencer" | "creator" | "model";

export type Role = {
  id: RoleId;
  /** The talent_type written to the database. */
  talentType: TalentType;
  slug: string;
  /** Singular, as a person would describe themselves. */
  label: string;
  /** Plural, for headings. */
  plural: string;
  /** The CSS custom property holding this role's colour. */
  accent: string;
  ground: string;
  hero: {
    overline: string;
    title: [string, string];
    lede: string;
    cta: string;
    /** Three short reassurances under the buttons. */
    assurances: string[];
  };
  /** What this role is actually selling, said in one line. */
  sells: string;
  /**
   * The running band of figures under the hero. Indicative market rates for
   * this role, not roster averages - they are here to set expectations before
   * somebody opens the form, and they are quoted in this role's own units:
   * per placement for an influencer, per video for a creator, per day for a
   * model.
   */
  ticker: { label: string; value: string }[];
  /**
   * The line item, as a media plan would set it out. Four rows, same four
   * questions for all three roles, so the reader can hold them against each
   * other even though they only ever see one at a time.
   */
  lineItem: { k: string; v: string }[];
  /** The fields that decide whether they get shortlisted. */
  shortlistedOn: { label: string; detail: string }[];
  /** What the form will ask for, so nobody starts it blind. */
  asked: string[];
  steps: { n: string; t: string; d: string }[];
  faqs: { q: string; a: string }[];
};

export const ROLES: Record<RoleId, Role> = {
  influencer: {
    id: "influencer",
    talentType: "influencer",
    slug: "/for-influencers",
    label: "Influencer",
    plural: "Influencers",
    accent: "var(--influencer)",
    ground: "ground-1",
    hero: {
      overline: "For influencers and content creators",
      title: ["Your audience.", "Your rate card."],
      lede: "Brands pay to reach the people who already follow you. List yourself once, set the price on every deliverable, and turn up when a brief matches — genre, city, language, budget.",
      cta: "List yourself — free",
      assurances: [
        "Free, and no commission on your rate",
        "No exclusivity — keep every other deal you have",
        "Your phone and email are never shown publicly",
      ],
    },
    sells: "You sell access to your audience. The post goes out on your channel, in your voice.",
    ticker: [
      { label: "FASHION", value: "4.2% ER · ₹12K/reel" },
      { label: "FITNESS", value: "6.1% ER · ₹9K/post" },
      { label: "FOOD", value: "3.8% ER · ₹22K/reel" },
      { label: "TECH", value: "6.4% ER · ₹9K/post" },
      { label: "FINANCE", value: "7.2% ER · ₹8K/post" },
      { label: "COMEDY", value: "4.4% ER · ₹30K/reel" },
      { label: "TRAVEL", value: "5.0% ER · ₹15K/reel" },
      { label: "BEAUTY", value: "4.9% ER · ₹18K/reel" },
    ],
    lineItem: [
      { k: "You sell", v: "Audience, trust, distribution" },
      { k: "Priced by", v: "Placement — per reel, story, post" },
      { k: "Shortlisted on", v: "Followers, engagement rate, audience city" },
      { k: "Reports into", v: "Reach and awareness KPIs" },
    ],
    shortlistedOn: [
      {
        label: "Reach and engagement",
        detail:
          "Follower count on each platform, your honest median views, and engagement rate. We verify these before a profile goes live, so accurate numbers work in your favour.",
      },
      {
        label: "Who actually watches",
        detail:
          "Audience split, largest age band and top cities. A brand launching in Pune shortlists on this long before it looks at your follower count.",
      },
      {
        label: "Your rate card",
        detail:
          "Reel, story, static post, YouTube integration — priced separately, by you. Nothing is negotiated behind your back and nothing is marked up.",
      },
    ],
    asked: [
      "Your handles and follower count per platform",
      "Engagement rate and average views",
      "Genre, languages and city",
      "A rate for each deliverable you offer",
    ],
    steps: [
      {
        n: "01",
        t: "Fill the form once",
        d: "Four steps, about six minutes. Only your name, email and one genre are compulsory — everything else widens the briefs you appear in.",
      },
      {
        n: "02",
        t: "We review and verify",
        d: "A person reads every submission, usually within two working days. We check your figures against your public profile before you go live.",
      },
      {
        n: "03",
        t: "You hear from us when a brief fits",
        d: "We filter the roster against the client's brief and send a shortlist. If you're on it, we come to you with the brand, the deliverable and the budget.",
      },
    ],
    faqs: [
      {
        q: "Does it cost anything?",
        a: "No. Listing is free and we don't take a cut of your rate. The agency is paid by the brand.",
      },
      {
        q: "Can other creators see my rates?",
        a: "No. There is no login for talent and no page that lists anyone. Your profile is visible to the agency team and to a client only when we put you on a shortlist for their brief.",
      },
      {
        q: "What if my rates change?",
        a: "Submit the form again with the same email. It updates your existing profile instead of creating a second one.",
      },
    ],
  },

  creator: {
    id: "creator",
    talentType: "creator",
    slug: "/for-creators",
    label: "Creator",
    plural: "Creators",
    accent: "var(--creator)",
    ground: "ground-3",
    hero: {
      overline: "For creators and ad-creative makers",
      title: ["No audience", "required."],
      lede: "You shoot it, the brand runs it as their own ad. Nobody asks for your follower count — the work is the portfolio, and craft, formats and turnaround are what get you booked.",
      cta: "Add your work — free",
      assurances: [
        "Free, and no commission on your rate",
        "Zero followers is genuinely fine",
        "Your phone and email are never shown publicly",
      ],
    },
    sells:
      "You sell the footage, not a following. The brand posts it on their own channels and pays for the content and its usage rights.",
    ticker: [
      { label: "BEAUTY", value: "₹5K/video · 48h turnaround" },
      { label: "UNBOXING", value: "₹6K/video · 72h turnaround" },
      { label: "FITNESS", value: "₹6K/video · 5-day turnaround" },
      { label: "TRAVEL", value: "₹7K/video · 72h turnaround" },
      { label: "TALKING HEAD", value: "₹4K/video · 48h turnaround" },
      { label: "PRODUCT DEMO", value: "₹8K/video · 5-day turnaround" },
      { label: "VOICEOVER", value: "₹3K/video · 24h turnaround" },
      { label: "FOOD", value: "₹7K/video · 4-day turnaround" },
    ],
    lineItem: [
      { k: "You sell", v: "Raw footage plus usage rights" },
      { k: "Priced by", v: "Deliverable — per video, per turnaround" },
      { k: "Shortlisted on", v: "Craft, format, samples, speed" },
      { k: "Reports into", v: "Paid and programmatic creative pipeline" },
    ],
    shortlistedOn: [
      {
        label: "Your samples",
        detail:
          "Six files is plenty. A brand decides in about eight seconds of footage, so lead with the strongest thing you've shot — not the longest.",
      },
      {
        label: "Formats and craft",
        detail:
          "Talking head, unboxing, product demo, voiceover, skit. Being specific about what you're good at gets you into more briefs, not fewer.",
      },
      {
        label: "Price and turnaround",
        detail:
          "Per video, and how many days from brief to delivered footage. Turnaround wins more content briefs than polish does — a reliable seven days beats a vague 'soon'.",
      },
    ],
    asked: [
      "Sample videos or a portfolio link",
      "The formats you deliver",
      "Your price per video",
      "Turnaround in days, and your city",
    ],
    steps: [
      {
        n: "01",
        t: "Upload your samples",
        d: "Four steps, about five minutes. Skip every follower field — the form doesn't ask you for one.",
      },
      {
        n: "02",
        t: "We review the work",
        d: "A person watches what you sent, usually within two working days. The samples are the whole review.",
      },
      {
        n: "03",
        t: "You get sent briefs, not auditions",
        d: "When a brand needs content in your format, we come to you with the deliverable, the usage terms and the budget already agreed.",
      },
    ],
    faqs: [
      {
        q: "I have almost no followers. Is that a problem?",
        a: "No. This is the one role where an audience is genuinely irrelevant — the brand is buying footage to run as their own ad.",
      },
      {
        q: "Who owns the video?",
        a: "You do, until usage is agreed. We record what each brief buys — how long, on which channels — before you shoot anything.",
      },
      {
        q: "Can other creators see my rates?",
        a: "No. There is no login for talent and no page that lists anyone. Only the agency team sees your profile.",
      },
    ],
  },

  model: {
    id: "model",
    talentType: "model",
    slug: "/for-models",
    label: "Model",
    plural: "Models",
    accent: "var(--model)",
    ground: "ground-4",
    hero: {
      overline: "For models and faces",
      title: ["Booked for", "the day."],
      lede: "Campaigns, catalogue, runway, print. You're paid for your time on set and the usage that follows — not for a post. Your digitals and your stats are the whole application.",
      cta: "Send your digitals — free",
      assurances: [
        "Free, and no commission on your day rate",
        "New faces welcome — experience is a field, not a filter",
        "Your measurements are shown to the agency only",
      ],
    },
    sells:
      "You sell the day, and the buyout that goes with it. You're in the shoot, not in the caption.",
    ticker: [
      { label: "CAMPAIGN", value: "₹25K/day · 12-month buyout" },
      { label: "CATALOGUE", value: "₹12K/day · digital only" },
      { label: "EDITORIAL", value: "₹8K/day · credit + usage" },
      { label: "RUNWAY", value: "₹15K/show · fittings paid" },
      { label: "COMMERCIAL", value: "₹30K/day · TVC buyout" },
      { label: "BEAUTY", value: "₹18K/day · 6-month print" },
      { label: "BRIDAL", value: "₹20K/day · regional OOH" },
      { label: "FITNESS", value: "₹14K/day · social only" },
    ],
    lineItem: [
      { k: "You sell", v: "Your time on set, plus the buyout" },
      { k: "Priced by", v: "Half day, full day, usage" },
      { k: "Shortlisted on", v: "Digitals, height, casting, availability" },
      { k: "Reports into", v: "Production and casting budgets" },
    ],
    shortlistedOn: [
      {
        label: "Your digitals",
        detail:
          "A clean headshot and a full-length, natural light, minimal make-up, plus any book shots. Casting looks at these before it reads a single word.",
      },
      {
        label: "Stats and casting",
        detail:
          "Height first — it's the one thing every brief filters on — then measurements, sizes and what you're cast for: runway, editorial, commercial, beauty, fitness, bridal.",
      },
      {
        label: "Day rate and buyout",
        detail:
          "Half day, full day, and what the rate covers. Being clear that print and OOH are quoted separately protects you later, and clients respect it.",
      },
    ],
    asked: [
      "Height, and measurements if you have them",
      "Digitals — headshot and full-length",
      "What you're cast for, and your experience level",
      "Half-day and full-day rate, and your buyout terms",
    ],
    steps: [
      {
        n: "01",
        t: "Send your digitals",
        d: "Four steps, about five minutes. Recent phone photos in daylight are fine — a professional book is not required to apply.",
      },
      {
        n: "02",
        t: "We review and file you",
        d: "A person reviews every application, usually within two working days, and files you against the categories you selected.",
      },
      {
        n: "03",
        t: "You get put up for castings",
        d: "When a shoot matches your stats and availability, we come to you with the client, the dates, the day rate and the usage.",
      },
    ],
    faqs: [
      {
        q: "I've never modelled professionally. Can I apply?",
        a: "Yes. Experience level is a field on the form, not a filter on the door — new faces are cast constantly, especially for commercial and catalogue work.",
      },
      {
        q: "Who sees my measurements?",
        a: "The agency team only. They are never published, never shown on a public page, and go to a client only with your shortlist.",
      },
      {
        q: "I'm already signed to an agency.",
        a: "Tell us on the form — there's a field for it. We check your exclusivity before pitching you for anything.",
      },
    ],
  },
};

export const ROLE_LIST = [
  ROLES.influencer,
  ROLES.creator,
  ROLES.model,
] as const;

export function roleById(id: string | null | undefined): Role | null {
  return id && id in ROLES ? ROLES[id as RoleId] : null;
}

/** The cookie remembering which door somebody came through. */
export const ROLE_COOKIE = "rr_role";

/**
 * How long somebody is held to the role they registered under.
 *
 * A roster is only useful if a record means something, and somebody who
 * re-applies as a model on Tuesday and an influencer on Thursday makes the
 * filters lie. Sixty days is long enough that the roster stays honest and
 * short enough that a genuine change of direction is not blocked forever.
 * It only ever restricts changing role - updating your own profile under the
 * role you already hold is unrestricted.
 */
export const ROLE_LOCK_DAYS = 60;
