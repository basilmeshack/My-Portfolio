import Hero from "@/components/hero"
import PartnerLogos from "@/components/partner-logos"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <PartnerLogos
        fieldType="partners"
        title="Professional"
        description="Throughout my career, I've collaborated with leading organizations across banking, payment processing, telecommunications, and technology sectors."
      />
    </main>
  )
}
