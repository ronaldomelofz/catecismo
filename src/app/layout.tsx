import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://consulta-igreja.netlify.app'),
  title: 'Consulta nos Documentos da Igreja | Catecismo e Direito Canônico',
  description: 'Busque e consulte facilmente o Catecismo da Igreja Católica e o Código de Direito Canônico. Ferramenta de pesquisa rápida e intuitiva para documentos oficiais da Igreja.',
  keywords: 'catecismo, direito canônico, igreja católica, vaticano, busca, consulta, documentos oficiais',
  authors: [{ name: 'Consulta Documentos Igreja' }],
  creator: 'Consulta Documentos Igreja',
  publisher: 'Consulta Documentos Igreja',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Consulta nos Documentos da Igreja',
    description: 'Busque e consulte facilmente o Catecismo da Igreja Católica e o Código de Direito Canônico',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consulta nos Documentos da Igreja',
    description: 'Busque e consulte facilmente o Catecismo da Igreja Católica e o Código de Direito Canônico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Consulta Igreja" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
} 