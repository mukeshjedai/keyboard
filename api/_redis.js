import crypto from 'node:crypto';
export function json(res,status,body){res.status(status).setHeader('Cache-Control','no-store').json(body);}
export function commandKey(device,secret){
  if(!/^[A-Za-z0-9_-]{8,32}$/.test(device||'')||!/^[A-Za-z0-9_-]{32,64}$/.test(secret||''))return null;
  return 'keyboard:'+crypto.createHash('sha256').update(device+':'+secret).digest('hex');
}
export async function redis(command){
  const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
  const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
  if(!url||!token)throw new Error('Redis is not configured');
  const response=await fetch(url.replace(/\/$/,'')+'/'+command.map(encodeURIComponent).join('/'),{headers:{Authorization:'Bearer '+token},cache:'no-store'});
  if(!response.ok)throw new Error('Relay unavailable'); return (await response.json()).result;
}
