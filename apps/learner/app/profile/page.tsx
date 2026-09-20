"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";
import { learnerFunction } from "../../lib/learner-api";

type Stats={xp:number;coins:number;level:number;streak:number;attempts:number;correct:number;answered:number;accuracy:number};
type Attempt={id:string;quizId:string;correct:number;total:number;percentage:number;xpEarned:number;coinsEarned:number};

async function call(action:string,token:string){return learnerFunction(action,{},token);}
function Nav(){return <nav className="ss-nav"><div className="ss-nav-inner">{[["⌂","Home","/"],["📚","Learn","/learn"],["▶","Play","/play"],["🏆","Compete","/compete"],["👤","Profile","/profile"]].map(([i,l,h])=><Link key={l} className={l==="Profile"?"active":""} href={h}><span className="ss-icon">{i}</span>{l}</Link>)}</div></nav>}