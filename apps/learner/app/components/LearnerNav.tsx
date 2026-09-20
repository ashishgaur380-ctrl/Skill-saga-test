"use client";
import Link from "next/link";
export default function LearnerNav({active}:{active:"Home"|"Learn"|"Play"|"Compete"|"Profile"}) {
 const items=[["⌂","Home","/"],["▤","Learn","/learn"],["▶","Play","/play"],["🏆","Compete","/compete"],["◉","Profile","/profile"]] as const;
 return <nav className="ss-nav"><div className="ss-nav-inner">{items.map(([icon,label,href])=><Link key={label} href={href} className={active===label?"active":""}><span className="ss-icon">{icon}</span><span>{label}</span></Link>)}</div></nav>;
}