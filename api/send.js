import {commandKey,json,redis} from './_redis.js';
export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  let body; try{body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};}catch(_){return json(res,400,{error:'Invalid JSON'});}
  const key=commandKey(body.device,body.secret),command=body.command;
  if(!key)return json(res,401,{error:'Invalid pairing details'});
  if(!command||!['text','key','shortcut'].includes(command.type))return json(res,400,{error:'Invalid command'});
  const encoded=JSON.stringify({type:command.type,value:command.value});
  if(encoded.length>2048)return json(res,413,{error:'Command too large'});
  try{await redis(['rpush',key,encoded]);await redis(['expire',key,'30']);return json(res,200,{ok:true});}
  catch(error){return json(res,503,{error:error.message});}
}
