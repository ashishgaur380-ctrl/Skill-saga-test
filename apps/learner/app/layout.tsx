export const metadata = {
  title: "Skill Saga",
  description: "A smarter way to learn"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body style={{ margin: 0 }}>{children}</body></html>;
}
