export default function TaglineBar() {
  return (
    <div className="bg-white px-6 lg:px-20 py-9 flex items-center gap-12 reveal">
      <div className="flex-shrink-0 w-px h-12 bg-[rgba(10,10,10,0.15)] hidden sm:block" />
      <p className="font-[family-name:var(--font-serif)] text-[clamp(17px,2.2vw,24px)] font-normal italic text-[#0a0a0a] leading-[1.5]">
        Aari Realty is a <strong className="not-italic font-semibold">boutique brokerage</strong> — intentionally small, deliberately high-standard.{" "}
        <strong className="not-italic font-semibold">We built the infrastructure. You run your business.</strong>
      </p>
    </div>
  );
}
