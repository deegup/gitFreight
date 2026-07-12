import { auth, signOut } from "@/auth";
import { createSocketToken } from "@/lib/socket-token";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard-client";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  const organizationId = process.env.PILOT_ORGANIZATION_ID || "demo-org";
  return <DashboardClient mapsKey={process.env.GOOGLE_MAPS_API_KEY || ""} socketToken={createSocketToken(organizationId)} userName={session.user.name || "Fleet manager"} userImage={session.user.image || undefined} signOutAction={async () => { "use server"; await signOut({ redirectTo: "/signin" }); }} />;
}
