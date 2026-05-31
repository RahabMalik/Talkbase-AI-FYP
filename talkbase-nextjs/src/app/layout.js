import './globals.css'

export const metadata = {
  title: 'TalkBase AI',
  description: 'AI-powered customer support chatbot platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
