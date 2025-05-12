# 🛁 Naked Deadlines 🛁

<p align="center">
  <img src="public/logo.png" alt="Naked Deadlines Logo" width="200" />
</p>

## About

Naked Deadlines is a unique accountability app that helps you meet your goals by raising the stakes. Set a deadline, upload an embarrassing photo, and if you don't complete your goal in time, the photo gets automatically tweeted from your account! It's motivation through potential embarrassment - the ultimate accountability tool.

## How It Works

1. **Set a Goal**: Define what you want to accomplish and when
2. **Upload an Embarrassing Photo**: This is your "collateral" - something you'd rather not share publicly
3. **Choose a Friend**: Select a friend to verify when you've completed your goal
4. **Get to Work**: Complete your goal before the deadline
5. **Verification**: Your friend confirms your completion, or...
6. **Face the Consequences**: Miss your deadline and your embarrassing photo goes public on Twitter

## Key Features

### 🔒 Security First

- **Local Storage Encryption**: Your embarrassing photos are stored securely in your browser's local storage with encryption
- **Server-Side Security**: All sensitive operations happen through secure server-side API routes
- **No Public Exposure**: Photos are only accessible with proper authentication and authorization
- **Automatic Cleanup**: Data is removed after goal completion or failure

### 🔑 Authentication

- Seamless Twitter OAuth integration
- Secure session management
- Uses your Twitter handle for identification

### 🎯 Goal Management

- Easy goal setting with deadlines
- Friend verification system using secure confirmation links
- UUID-based confirmation tokens for security
- Paid "chicken out" option (99¢) for those who want to cancel their timer

### 🎉 User Experience

- Playful bathroom-themed UI with animations and decorations
- Celebratory success screens
- Mobile-responsive design
- Real-time deadline tracking

## Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: NextAuth.js with Twitter OAuth
- **Database**: Supabase
- **Email**: Brevo API for confirmation emails
- **Payments**: Stripe for "chicken out" payments
- **Deployment**: Vercel

## Fun Facts

- The bathroom theme was chosen because when you're "naked" (vulnerable), you're most likely to be in a bathroom! 🚿
- The rubber ducks throughout the UI are accountability buddies watching your progress
- The app generates random, humorous tweets when you fail to meet your deadline
- Every successful goal completion triggers a bubble animation celebration
- The app was designed to be both motivating and slightly anxiety-inducing (in a good way!)

## Privacy & Security

Naked Deadlines takes your privacy seriously:

- We never store your embarrassing photos on our servers
- Photos remain in your encrypted local storage until needed
- Confirmation tokens are randomly generated UUIDs
- All API routes are properly secured against unauthorized access
- Environment variables are kept server-side only

## Getting Started

### Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

### Environment Variables

Create a `.env` file with the following:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
AUTH_SECRET=your_auth_secret
NEXT_PUBLIC_APP_URL=your_app_url
BREVO_API_KEY=your_brevo_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add them to your `.env` file
4. For testing, use Stripe's test cards (e.g., `4242 4242 4242 4242` with any future expiry date and any CVC)

## License

MIT

---

<p align="center">Made with 💧 and 🧼</p>
