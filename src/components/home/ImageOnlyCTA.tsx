"use client";

import Image from "next/image";
import Link from "next/link";

interface Props {
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
}

export function ImageOnlyCTA({
  imageUrl = "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=1600&q=80",
  linkUrl = "/shop",
  altText = "ANGELIX Luxury Fragrance Collection",
}: Props) {
  return (
    <section style={{ position: "relative", width: "100%", height: "60vh", minHeight: "400px", cursor: "pointer" }}>
      <Link href={linkUrl} aria-label={altText} style={{ display: "block", height: "100%", position: "relative" }} className="img-zoom-wrap">
        <Image
          src={imageUrl}
          alt={altText}
          fill
          unoptimized
          sizes="100vw"
          style={{ objectFit: "cover", transition: "transform 0.8s var(--ease-luxury)" }}
        />
      </Link>
    </section>
  );
}

