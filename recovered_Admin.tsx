

mport React, { createContext, useContext, useEffect, useState } from 'react';


mport { onAuthStateChanged, User, s

gnOut } from 'f

rebase/auth';


mport { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'f

rebase/f

restore';


mport { auth, db } from '../l

b/f

rebase';


mport { getCachedDoc } from '../l

b/cache';


mport { useLanguage } from './LanguageProv

der';


mport { Sh

eldAlert, LogOut } from 'luc

de-react';



const safeStr

ng

fy = (obj: any) => {
  try {
    const cache = new Set();
    return JSON.str

ng

fy(obj, (key, value) => {
      

f (typeof value === 'object' && value !== null) {
        

f (cache.has(value)) return undef

ned;
        cache.add(value);
        // Str

p out complex F

restore objects wh

ch cause c

rcular refs or getters throw

ng
        

f (value.constructor && value.constructor.name !== 'Object' && value.constructor.name !== 'Array') {
          return undef

ned; 
        }
      }
      return value;
    });
  } catch (e) {
    return '{}';
  }
};
export 

nterface UserProf

le {
  u

d?: str

ng;
  fullName: str

ng;
  ema

l: str

ng;
  photoURL?: str

ng;
  myReferCode: str

ng;
  usedReferCode: str

ng;
  balances: {
    ma

n: number;
    bonus: number;
    referral: number;
    partner?: number;
    tasks?: Record<str

ng, number>;
    g

ft?: number;
  };
  role: str

ng;
  perm

ss

ons?: str

ng[];
  

sAct

ve?: boolean;
  referralBonusPa

d?: boolean;
  totalReferrals?: number;
  referralCount?: number;
  partnerCla

medAt?: any;
  to    const fetchSiteSettings =