import type { Metadata } from "next";
import { RoleLanding } from "@/components/role-landing";
import { ROLES } from "@/lib/roles";

export const metadata: Metadata = {
  title: "For creators — no audience required",
  description:
    "You shoot it, the brand runs it as their own ad. Samples, formats and turnaround are what get you booked — nobody asks for your follower count.",
};

export default function ForCreatorsPage() {
  return <RoleLanding role={ROLES.creator} />;
}
