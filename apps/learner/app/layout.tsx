import "./globals.css";

export const metadata={title:"Skill Saga",description:"A smarter way to learn"};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}</body></html>;
}