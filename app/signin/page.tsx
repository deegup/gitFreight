import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  if (await auth()) redirect("/");
  return <main className="signin-shell"><section className="signin-card"><div className="signin-mark">◉</div><p className="eyebrow">FLEET INTELLIGENCE FOR INDIA</p><h1>Welcome to FleetPulse</h1><p>Sign in with an approved Google account to access your fleet workspace.</p><form action={async () => { "use server"; await signIn("google", { redirectTo: "/" }); }}><button className="google-button" type="submit"><span>G</span> Continue with Google</button></form><small>Access is limited to your pilot organization.</small></section></main>;
}
