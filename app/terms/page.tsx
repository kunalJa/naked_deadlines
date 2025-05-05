import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Terms and Conditions</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>Terms and Conditions for NakedDeadlines</h2>
            <p>
              <strong>Effective Date:</strong>{" "}
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            <p>Welcome to NakedDeadlines. By using our Services, you agree to the following terms:</p>

            <h3>1. Content Ownership and Responsibility</h3>
            <ul>
              <li>You are solely responsible for the content you upload.</li>
              <li>
                You represent and warrant that you have all rights necessary to upload and authorize us to post your
                content to Twitter.
              </li>
            </ul>

            <h3>2. Consent to Publish</h3>
            <p>
              By uploading a photo and connecting your Twitter account through the Twitter API, you consent to us
              posting it on your Twitter account according to your instructions.
            </p>

            <h3>3. Compliance with Twitter Policies</h3>
            <ul>
              <li>All uploaded photos must comply with Twitter's Terms of Service and Twitter's Content Guidelines.</li>
              <li>You agree to comply with all applicable Twitter API Terms of Use.</li>
              <li>
                We are not responsible for any content removed by Twitter or any actions taken by Twitter against your
                account.
              </li>
            </ul>

            <h3>4. Prohibited Content</h3>
            <p>You agree not to upload illegal, defamatory, abusive, obscene, or otherwise prohibited material.</p>

            <h3>5. No Liability</h3>
            <p>
              NakedDeadlines is not liable for any loss, harm, or consequences resulting from your uploaded content
              being shared on Twitter.
            </p>

            <h3>6. Authorization and Revocation</h3>
            <ul>
              <li>
                You may revoke our access to your Twitter account at any time through your Twitter account settings.
              </li>
              <li>Revoking access will terminate our ability to post on your behalf.</li>
            </ul>

            <h3>7. Termination</h3>
            <p>We reserve the right to suspend or terminate access to the Services if you violate these Terms.</p>

            <h3>8. Changes to the Terms</h3>
            <p>
              We may update these Terms at any time. Continued use of the Services after changes means you accept the
              updated Terms.
            </p>

            <h3>Contact Us</h3>
            <p>Questions? Contact us at: support@nakeddeadlines.com</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
