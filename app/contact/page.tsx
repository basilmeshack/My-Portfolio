import ContactForm from "@/components/contact-form"
import ContactInfo from "@/components/contact-info"

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Get In <span className="text-purple-600">Touch</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ContactInfo />
        <ContactForm />
      </div>
    </main>
  )
}
