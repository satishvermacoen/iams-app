// src/app/layout.jsx
import "./globals.css";
import { AppProviders } from "./providers";

export const metadata = {
  title: "IAMS",
  description: "Integrated Academic Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
