import type { Metadata } from "next";
import { RoleLanding } from "@/components/role-landing";
import { ROLES } from "@/lib/roles";

export const metadata: Metadata = {
  title: "For influencers — your audience, your rate card",
  description:
    "List yourself free, set the price on every deliverable, and get sent briefs that match your genre, city and audience. No commission, no exclusivity.",
};

export default function ForInfluencersPage() {
  return <RoleLanding role={ROLES.influencer} />;
}
