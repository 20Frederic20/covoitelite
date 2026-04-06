import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CovoitElite - Covoiturage d\'Élite',
  description: 'La solution de covoiturage premium pour vos trajets quotidiens.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-black text-white antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
