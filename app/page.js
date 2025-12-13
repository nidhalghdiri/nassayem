import { redirect } from "next/navigation";

// This is a server component
export default function RootPage() {
  // This will only run if middleware fails
  redirect("/en");

  return null;
}
