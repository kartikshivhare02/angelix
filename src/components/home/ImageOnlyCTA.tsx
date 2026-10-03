"use client";

import Image from "next/image";
import Link from "next/link";

interface ImageOnlyCTAProps {
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
}

export function ImageOnlyCTA({
  imageUrl = "/images/cta-collection.jpg",
  linkUrl = "/shop",
  altText = "ANGELIX Luxury Fragrance Collection",
}: ImageOnlyCTAProps) {
  return (
    <section style={{ position: "relative", width: "100%", height: "65vh", minHeight: "420px" }}>
      <Link
        href={linkUrl}
        aria-label={altText}
        style={{ display: "block", height: "100%", position: "relative" }}
        className="img-zoom-wrap"
      >
        <Image
          src={imageUrl}
          alt={altText}
          fill
          unoptimized
          priority
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            transition: "transform 0.8s var(--ease-luxury)",
          }}
        />
      </Link>
    </section>
  );
}
