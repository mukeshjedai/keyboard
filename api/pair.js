import { json, redis } from './_redis.js';

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(!/^\d{6}$/.test(body.code||''))return json(res,400,{error:'Enter the six-digit code'});
  try{const raw=await redis(['getdel','pair:'+body.code]);if(!raw)return json(res,404,{error:'Code not found or expired'});return json(res,200,JSON.parse(raw));}
  catch(error){return json(res,503,{error:error.message});}
}
