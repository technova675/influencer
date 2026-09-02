import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LandingChips } from "@/components/landing-chips";
import "./landing.css";

export const metadata: Metadata = {
  title: "Adbibe Creator Network — creators, scored like a media plan",
};

/**
 * The landing page, reproduced from the supplied reference.
 *
 * Every word, figure and class name below is the reference's. Two things are
 * deliberately not:
 *
 *   1. The nav's first item reads "Influencer" rather than "Roster", as asked.
 *   2. The four nav destinations and the CTAs point at the real routes rather
 *      than at on-page anchors, so the pages that already exist for each
 *      audience are reachable. "How it's scored" keeps its #scoring anchor,
 *      because that section is on this page.
 *
 * The reference builds the ticker, the ledger and the genre grid from arrays in
 * a trailing <script>. Those arrays are kept verbatim here and rendered on the
 * server instead, which produces the same markup without shipping a script or
 * leaving the page briefly empty.
 */

const creators = [
  { name: "Meher Kapoor", genre: "Fashion", type: "Influencer", reach: "84K", er: "5.1%", rate: "₹12K /reel" },
  { name: "Rohan Iyer", genre: "Fitness", type: "UGC", reach: "—", er: "n/a", rate: "₹6K /video" },
  { name: "Aisha Noor", genre: "Food", type: "Influencer", reach: "156K", er: "3.8%", rate: "₹22K /reel" },
  { name: "Devansh Rao", genre: "Tech", type: "Influencer", reach: "41K", er: "6.4%", rate: "₹9K /post" },
  { name: "Priyal Shah", genre: "Beauty", type: "UGC", reach: "—", er: "n/a", rate: "₹5K /video" },
  { name: "Kabir Malhotra", genre: "Finance", type: "Influencer", reach: "29K", er: "7.2%", rate: "₹8K /post" },
  { name: "Sana Ahmed", genre: "Comedy", type: "Influencer", reach: "212K", er: "4.4%", rate: "₹30K /reel" },
  { name: "Yusuf Merchant", genre: "Travel", type: "UGC", reach: "—", er: "n/a", rate: "₹7K /video" },
];

const initials = (n: string) =>
  n.split(" ").map((w) => w[0]).slice(0, 2).join("");

const genres = ["Fashion", "Beauty", "Food", "Fitness", "Travel", "Finance", "Tech", "Comedy", "Lifestyle", "Gaming", "Parenting", "Automobile", "Education", "Music"];

const tickerItems = [
  { label: "FASHION", val: "4.2% ER · ₹12K/reel", up: true },
  { label: "UGC · BEAUTY", val: "₹5K/video · 48h turnaround", up: false },
  { label: "FITNESS", val: "6.1% ER · ₹9K/post", up: true },
  { label: "FOOD", val: "3.8% ER · ₹22K/reel", up: false },
  { label: "TECH", val: "6.4% ER · ₹9K/post", up: true },
  { label: "UGC · TRAVEL", val: "₹7K/video · 72h turnaround", up: false },
  { label: "FINANCE", val: "7.2% ER · ₹8K/post", up: true },
  { label: "COMEDY", val: "4.4% ER · ₹30K/reel", up: false },
];

/* Duplicated for a seamless loop, exactly as the reference does. The copy is
   hidden from assistive tech so the roster is not announced twice. */
const buildTicks = (copy: number) =>
  tickerItems.map((t, i) => (
    <div className="tick" key={`${copy}-${i}`}>
      <span className={t.up ? "up" : ""}>{t.label}</span>
      <b>{t.val}</b>
    </div>
  ));

export default function LandingPage() {
  return (
    <div id="adbibe">
      <header>
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">
              <Image src="/logo.png" alt="" width={26} height={26} priority />
            </div>
            <div>
              <div className="brand-name">Adbibe</div>
              <div className="brand-sub">Creator Network</div>
            </div>
          </div>
          <nav className="links">
            <Link href="/for-influencers">Influencer</Link>
            {/* <Link href="/for-brands">For brands</Link> */}
            <Link href="/for-creators">For creators</Link>
            <a href="#scoring">How it&apos;s scored</a>
          </nav>
          <Link href="/for-brands#brief" className="cta-mini">Get a shortlist</Link>
        </div>
      </header>

      <main>
        <section className="hero" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            <div className="eyebrow">Adbibe · Performance Marketing / Influencer Line</div>
            <h1>Creators, scored the way we score <em>every other channel.</em></h1>
            <p className="hero-sub">No portfolios, no PDFs. Every creator on this roster carries the same numbers Adbibe already tracks for paid and programmatic — engagement rate, cost per deliverable, turnaround — so you can brief influencer the way you brief media.</p>
            <div className="hero-ctas">
              <a href="#roster" className="btn btn-primary">Browse the roster →</a>
              <Link href="/for-creators" className="btn btn-ghost">List yourself, free</Link>
            </div>
          </div>

          <div className="ticker-wrap" role="img" aria-label="Live roster sample metrics" style={{ marginTop: 52 }}>
            <div className="ticker-track">
              {buildTicks(0)}
              <div className="contents" aria-hidden>{buildTicks(1)}</div>
            </div>
          </div>

          <div className="wrap stats" style={{ paddingTop: 0 }}>
            <div className="stat"><div className="num">312</div><div className="lbl">Creators live</div></div>
            <div className="stat"><div className="num">18</div><div className="lbl">Cities covered</div></div>
            <div className="stat"><div className="num">4.6%</div><div className="lbl">Median engagement</div></div>
            <div className="stat"><div className="num">48h</div><div className="lbl">Avg. shortlist time</div></div>
          </div>
        </section>

        <section id="lanes-section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="section-tag">Two line items, kept separate</div>
                <h2>Influence and UGC report to different KPIs. Adbibe keeps them apart.</h2>
              </div>
              <p className="section-note">Most rosters blend the two into one list. We split them the way a media plan would — different metrics, different pricing logic, different filters.</p>
            </div>
            <div className="lanes">
              <div className="lane">
                <div className="lane-kicker">Lane 01 — Influencer</div>
                <h3>Sells reach on their own channel</h3>
                <div className="spec-row"><span className="k">You&apos;re buying</span><span className="v">Audience, trust, distribution</span></div>
                <div className="spec-row"><span className="k">Priced by</span><span className="v">Placement — per reel, story, post</span></div>
                <div className="spec-row"><span className="k">Adbibe filters on</span><span className="v">Followers, engagement rate, audience city</span></div>
                <div className="spec-row"><span className="k">Reports into</span><span className="v">Reach &amp; awareness KPIs</span></div>
                <Link href="/for-influencers" className="btn btn-ghost">See influencers</Link>
              </div>
              <div className="lane">
                <div className="lane-kicker">Lane 02 — UGC creator</div>
                <h3>Sells the footage, not an audience</h3>
                <div className="spec-row"><span className="k">You&apos;re buying</span><span className="v">Raw content + usage rights, to run as your own ad</span></div>
                <div className="spec-row"><span className="k">Priced by</span><span className="v">Deliverable — per video, per turnaround</span></div>
                <div className="spec-row"><span className="k">Adbibe filters on</span><span className="v">Craft, format, sample reel, speed</span></div>
                <div className="spec-row"><span className="k">Reports into</span><span className="v">Paid &amp; programmatic creative pipeline</span></div>
                <Link href="/for-creators" className="btn btn-ghost">See UGC creators</Link>
              </div>
            </div>
          </div>
        </section>

        <section id="roster">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="section-tag">The roster</div>
                <h2>Filter it like a media plan, not a mood board.</h2>
              </div>
              <p className="section-note">A sample of what&apos;s live. Every card ships with rates already attached — no back-and-forth to find out budget fit.</p>
            </div>

            <LandingChips />

            <div className="ledger">
              <div className="ledger-head">
                <div>Creator</div>
                <div>Type</div>
                <div>Reach</div>
                <div>Engagement</div>
                <div>Rate from</div>
                <div></div>
              </div>
              <div>
                {creators.map((c) => (
                  <div className="row" key={c.name}>
                    <div className="who">
                      <div className="avatar">{initials(c.name)}</div>
                      <div>
                        <div className="who-name">{c.name}</div>
                        <div className="who-genre">{c.genre}</div>
                      </div>
                    </div>
                    <div className="cell"><span className="cell-lbl">Type</span><span className={c.type === "UGC" ? "tag ugc" : "tag"}>{c.type}</span></div>
                    <div className="cell"><span className="cell-lbl">Reach</span><span className="cell-val">{c.reach}</span></div>
                    <div className="cell"><span className="cell-lbl">Engagement</span><span className="cell-val pos">{c.er}</span></div>
                    <div className="cell"><span className="cell-lbl">Rate from</span><span className="cell-val">{c.rate}</span></div>
                    <Link href="/for-brands#brief" className="row-cta">Shortlist →</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="section-tag">Every genre a brief asks for</div>
                <h2>Sorted the way a client thinks about it.</h2>
              </div>
            </div>
            <div className="genres">
              {genres.map((g) => (
                <a href="#roster" className="genre-pill" key={g}>{g}</a>
              ))}
            </div>
          </div>
        </section>

        <section id="scoring">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="section-tag">How the roster is scored</div>
                <h2>The same three checks Adbibe runs before any channel goes live.</h2>
              </div>
            </div>
            <div className="score-grid">
              <div className="score-card">
                <div className="score-idx">01 / Verify</div>
                <h4>Audience, not just followers</h4>
                <p>We check engagement quality and audience geography before a profile goes live — the same fraud checks Adbibe runs on paid traffic sources.</p>
              </div>
              <div className="score-card">
                <div className="score-idx">02 / Benchmark</div>
                <h4>Rate against category norms</h4>
                <p>Every rate is compared against genre and tier benchmarks, so a &quot;good deal&quot; is measured, not guessed.</p>
              </div>
              <div className="score-card">
                <div className="score-idx">03 / Track</div>
                <h4>Delivery history, kept on file</h4>
                <p>Turnaround time and brief adherence from past campaigns follow the profile — reliability becomes a filterable stat.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="brands">
          <div className="wrap final" style={{ padding: "64px 48px", borderRadius: 2 }}>
            <div className="section-head" style={{ marginBottom: 28 }}>
              <div>
                <div className="section-tag" style={{ color: "#A6A8A0" }}>For brands</div>
                <h2>Brief it like paid media. Get a shortlist back the same day.</h2>
              </div>
              <p className="section-note">Hand Adbibe a budget and a KPI — we filter the roster and hand back a shortlist with rates already attached.</p>
            </div>
            <div className="hero-ctas">
              <Link href="/for-brands#brief" className="btn btn-primary">Browse the full roster →</Link>
              <Link href="/for-creators" className="btn btn-ghost">I want to list myself</Link>
            </div>
          </div>
        </section>

        <section id="creators" style={{ paddingTop: 56 }}>
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="section-tag">For creators</div>
                <h2>List yourself free. Set your own rate.</h2>
              </div>
              <p className="section-note">Five questions, reviewed within 48 hours, then discoverable by every filter above — genre, city, budget, format.</p>
            </div>
            <Link href="/for-creators" className="btn btn-primary">Add yourself to the roster</Link>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <div>© 2026 <Link href="/">Adbibe</Link> — Creator Network is part of Adbibe&apos;s influencer marketing line.</div>
          <div className="foot-links">
            <Link href="/for-influencers">Influencer</Link>
            <Link href="/for-brands">For brands</Link>
            <Link href="/for-creators">For creators</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
