import{h as a}from"../index-2dfc125e.js";const o=(o,s,t,e)=>a.post("/v1/auth/jrag/login",{username:o,password:s,validateCode:t,hash:e}),s=()=>a.get("/v1/auth/jrag/logout");export{s as a,o as l};
