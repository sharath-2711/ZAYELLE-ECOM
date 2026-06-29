import { Dancing_Script, Manrope } from "next/font/google";
import "./globals.css";

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-secondary",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Zayelle | Personalized Gifts Made Beautiful",
  description: "Thoughtfully crafted gifts customized just for your loved ones.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${dancing.variable} ${manrope.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

