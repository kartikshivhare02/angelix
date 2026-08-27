import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — ANGLELIX by Suraj",
  description: "Get in touch with ANGLELIX — for order queries, product questions, or anything else. We are here to help.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
