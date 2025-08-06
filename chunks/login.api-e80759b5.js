import{h as a}from"../index-be3b3ce2.js";const o=(o,s,e,t)=>a.post("/v1/auth/jrag/login",{username:o,password:s,validateCode:e,hash:t}),s=()=>a.get("/v1/auth/jrag/logout");export{s as a,o as l};
