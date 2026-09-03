import { json, redis } from './_redis.js';

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(!/^\d{6}$/.test(body.code||'')||!/^[A-Za-z0-9_-]{8,32}$/.test(body.device||'')||!/^[A-Za-z0-9_-]{32,64}$/.test(body.secret||''))return json(res,400,{error:'Invalid registration'});
  try{await redis(['set','pair:'+body.code,JSON.stringify({device:body.device,secret:body.secret}),'ex','600']);return json(res,200,{ok:true});}
  catch(error){return json(res,503,{error:error.message});}
}
