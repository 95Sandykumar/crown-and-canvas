import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Military Pet Portraits | Custom Pet in Uniform",
  description:
    "Transform your pet into a decorated military hero. Custom pet portraits in Army, Navy, Marines, Air Force, Coast Guard & Space Force uniforms. The perfect gift for veterans and military families. Starting at $29.",
  keywords: [
    "military pet portrait",
    "pet military uniform",
    "pet in army uniform",
    "pet in navy uniform",
    "pet in marine uniform",
    "military dog portrait",
    "veteran pet gift",
    "military family gift",
    "custom pet portrait military",
    "pet portrait canvas military",
    "armed forces pet portrait",
    "pet in uniform painting",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Military Pet Portraits | Honor Your Pet's Service",
    description:
      "Transform your pet into a decorated military hero. Custom portraits in all 6 branch uniforms. The perfect gift for veterans and military families.",
    images: [
      {
        url: "/portraits/military-general/after.webp",
        width: 1200,
        height: 1200,
        alt: "Pet transformed into a decorated military general portrait",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Military Pet Portraits | Honor Your Pet's Service",
    description:
      "Transform your pet into a decorated military hero. Custom portraits in all 6 branch uniforms. Starting at $29.",
    images: ["/portraits/military-general/after.webp"],
  },
};

export default function MilitaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
