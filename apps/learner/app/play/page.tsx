"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";
import { learnerFunction } from "../../lib/learner-api";

type Quiz={id:string;title:string;description:string;questionCount:number};
type Question={id:string;questionText:string;options:string[];marks:number};
type Result={correct:number;total:number;marks:number;totalMarks:number;percentage:number;xpEarned?:number;coinsEarned?:number};
async function call(action:string,data:any,token:string){return learnerFunction(action,data,token);}