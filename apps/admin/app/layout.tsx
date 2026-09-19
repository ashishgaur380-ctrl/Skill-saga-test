import "./globals.css";

export const metadata = {
  title: "Skill Saga Admin",
  description: "Skill Saga 2.0 Administration Console"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
