import type { Metadata } from "next";
import { RoleLanding } from "@/components/role-landing";
import { ROLES } from "@/lib/roles";

export const metadata: Metadata = {
  title: "For models — booked for the day",
  description:
    "Campaigns, catalogue, runway and print. Send your digitals and stats once; your measurements are shown to the agency only, never published.",
};

export default function ForModelsPage() {
  return <RoleLanding role={ROLES.model} />;
}
