import {commandKey,json,redis} from './_redis.js';
export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
  const key=commandKey(req.query.device,req.query.secret);if(!key)return json(res,401,{error:'Invalid pairing details'});
  try{const commands=[];for(let i=0;i<30;i++){const raw=await redis(['lpop',key]);if(!raw)break;try{commands.push(JSON.parse(raw));}catch(_){}}return json(res,200,{ok:true,commands});}
  catch(error){return json(res,503,{error:error.message});}
}
