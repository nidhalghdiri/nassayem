// This is a SERVER COMPONENT - no 'use client'
import { redirect } from "next/navigation";

export default function RootPage() {
  console.log("Root page redirecting to /en");
  redirect("/en");

  // This won't render because redirect happens first
  return null;
}
