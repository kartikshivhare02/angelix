import Link from "next/link";

export function BrandStory() {
  return (
    <section className="section-py" style={{ background: "var(--color-bg-soft)" }}>
      <div
        className="container-site"
        style={{ maxWidth: "800px", textAlign: "center" }}
      >
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
          Our Philosophy
        </p>
        <h2
          className="heading-editorial"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", marginBottom: "2rem" }}
        >
          Fragrance as an art form.
          <br />Not a commodity.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.8,
            marginBottom: "1.5rem",
          }}
        >
          ANGELIX was born from a singular belief — that a truly exceptional fragrance 
          should be an extension of character, not merely a scent. Founded by Suraj, 
          every bottle is crafted with obsessive attention to quality, longevity, and identity.
        </p>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.8,
            marginBottom: "2.5rem",
          }}
        >
          We source the finest raw ingredients — genuine oud, Bulgarian rose absolute, 
          Italian bergamot — blending them into compositions that last, evolve, and linger.
        </p>
        <Link href="/about" className="btn-outline">
          Know Our Story
        </Link>
      </div>
    </section>
  );
}
