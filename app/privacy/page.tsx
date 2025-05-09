import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>Privacy Policy for NakedDeadlines</h2>
            <p>
              <strong>Effective Date:</strong>{" "}
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            <p>
              NakedDeadlines ("we," "our," or "us") values your privacy. This Privacy Policy explains how we collect,
              use, and share information about you when you use our website and services ("Services").
            </p>

            <h3>Information We Collect</h3>
            <ul>
              <li>
                <strong>Account Information:</strong> We collect your Twitter username, basic
                contact information, and authorization tokens via Twitter's API.
              </li>
              <li>
                <strong>Goal Information:</strong> We store your goal description and deadline information.
              </li>
            </ul>

            <h3>How We Use Your Information</h3>
            <ul>
              <li>
                To facilitate the posting of your photo to your Twitter account ONLY if you miss your deadline, using the
                Twitter API.
              </li>
              <li>To track your goals and deadlines.</li>
              <li>To operate, maintain, and improve the Services.</li>
            </ul>

            <h3>Sharing of Information</h3>
            <ul>
              <li>
                <strong>Your Privacy is Our Priority:</strong> Your uploaded photos remain entirely local to your browser and are never sent to our servers.
              </li>
              <li>
                We share your photo to Twitter ONLY if you miss your deadline, using the authorization you provided.
              </li>
              <li>
                We may access your Twitter account via the Twitter API strictly for posting content if you miss your deadline.
              </li>
              <li>We do not sell your information to third parties.</li>
            </ul>

            <h3>User Responsibility</h3>
            <ul>
              <li>
                By uploading a photo and authorizing access via the Twitter API, you affirm that you own the content or
                have the necessary rights to share it.
              </li>
              <li>
                You agree that your uploaded photo complies with Twitter's Terms of Service and Twitter's Content
                Guidelines.
              </li>
            </ul>

            <h3>Data Retention</h3>
            <p>
              Your photos are stored locally in your browser's storage and are never transmitted to our servers. 
              Access tokens and goal information are stored only as long as necessary to provide our service or as otherwise permitted by law.
            </p>

            <h3>Security</h3>
            <p>
              We implement reasonable measures to protect your information, including encrypted storage of access
              tokens, but no system is 100% secure.
            </p>

            <h3>Changes to This Privacy Policy</h3>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes.</p>

            <h3>Contact Us</h3>
            <p>If you have any questions, contact us at: support@mail.nakeddeadlines.com</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
