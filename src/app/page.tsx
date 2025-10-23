import { redirect } from "next/navigation";

export default function HomePage() {
  // Since this is a single-user app, redirect directly to dashboard
  redirect("/dashboard");
}
