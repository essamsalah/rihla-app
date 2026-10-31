const BASE='https://yce-api-01.makeupar.com';
export const ALLOWED_CATEGORIES=['upper_body','lower_body','outer','shoes','full_body','auto'];
export class AppError extends Error {status:number;constructor(message:string,status=400){super(message);this.status=status}}
export function validateImage(file:File,label:string){
 if(!file||typeof file.arrayBuffer!=='function'||!['image/jpeg','image/png'].includes(file.type))throw new AppError(`${label}: choose a JPEG or PNG image.`);
 if(file.size===0||file.size>8*1024*1024)throw new AppError(`${label}: use an image smaller than 8 MB.`);
}
async function signatureCheck(file:File){const b=new Uint8Array(await file.slice(0,8).arrayBuffer());const valid=file.type==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71&&b[4]===13&&b[5]===10&&b[6]===26&&b[7]===10;if(!valid)throw new AppError('The image contents do not match its JPEG or PNG format.');}
export function safeResultUrl(value:unknown):string|null{try{const u=new URL(String(value));return u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}}
export function makeYoucam(key:string,fetcher:typeof fetch=fetch){
 async function request(path:string,init:RequestInit={}){
  let response:Response;try{response=await fetcher(BASE+path,{...init,headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json',...init.headers},signal:AbortSignal.timeout(45000)});}catch{throw new AppError('YouCam could not be reached. Please try again later.',502)}
  const body=await response.json().catch(()=>null) as any;
  if(!response.ok||!body||body.status>=400){const status=response.status===401?503:response.status===429?429:502;throw new AppError(status===503?'The preview service key needs checking.':status===429?'The preview service is busy or has reached its limit. Try again later.':'YouCam could not process this request. Check your images and try again.',status)}
  return body.data;
 }
 async function upload(file:File,label:string){
  validateImage(file,label);await signatureCheck(file);
  const data=await request('/s2s/v2.0/file',{method:'POST',body:JSON.stringify({files:[{content_type:file.type,file_name:'rihla-'+crypto.randomUUID()+(file.type==='image/png'?'.png':'.jpg'),file_size:file.size}]})});
  const entry=data?.files?.[0],up=entry?.requests?.[0];
  if(!entry?.file_id||!up?.url)throw new AppError('The image upload could not be prepared.',502);
  const url=new URL(up.url);
  if(url.protocol!=='https:'||!/(^|\.)amazonaws\.com$/.test(url.hostname)||up.method!=='PUT')throw new AppError('The preview service returned an unsupported upload destination.',502);
  const headers=new Headers(up.headers||{});headers.delete('Authorization');
  // Blob bodies have a known byte length in Workers; preserve the signed upload headers.
  headers.set('Content-Length',String(file.size));
  let res:Response;try{res=await fetcher(url.href,{method:'PUT',headers,body:file,redirect:'manual',signal:AbortSignal.timeout(45000)})}catch{console.error('youcam_upload',{stage:label,outcome:'network_error'});throw new AppError(`${label} could not be transferred to YouCam. Please try again.`,502)}
  if(!res.ok){const detail=await res.text();const code=detail.match(/<Code>([A-Za-z0-9_]+)<\/Code>/)?.[1]||'UploadRejected';console.error('youcam_upload',{stage:label,status:res.status,code});throw new AppError(`${label} upload was rejected (${code}). Please try again.`,502);}
  return entry.file_id as string;
 }
 async function submit(source:{src_file_id?:string;src_file_url?:string},ref:string,category:string){const data=await request('/s2s/v2.0/task/cloth-v4',{method:'POST',body:JSON.stringify({...source,ref_file_id:ref,garment_category:category,change_shoes:false,filter_multi_person:'strict'})});if(typeof data?.task_id!=='string')throw new AppError('The preview could not be started.',502);return data.task_id as string;}
 async function status(id:string){const data=await request('/s2s/v2.0/task/cloth-v4/'+encodeURIComponent(id));if(data.task_status==='error')throw new AppError('YouCam could not create this preview. Try a clear, front-facing photo with one person and an unobstructed garment.',422);if(data.task_status==='success'){const url=safeResultUrl(data.results?.url);if(!url)throw new AppError('The preview finished without a usable image.',502);return {status:'success',url}}return {status:'running',url:null};}
 function validateCategory(category:string){if(!ALLOWED_CATEGORIES.includes(category))throw new AppError('Choose a supported garment category.');}
 return {
  async create(person:File,garment:File,category:string){validateCategory(category);validateImage(person,'Your photo');validateImage(garment,'Garment photo');const [src,ref]=await Promise.all([upload(person,'Your photo'),upload(garment,'Garment photo')]);return submit({src_file_id:src},ref,category);},
  async createFromTask(previousId:string,garment:File,category:string){validateCategory(category);validateImage(garment,'Garment photo');const previous=await status(previousId);if(previous.status!=='success'||!previous.url)throw new AppError('The previous garment preview is not ready yet.',409);const ref=await upload(garment,'Garment photo');return submit({src_file_url:previous.url},ref,category);},
  status
 };
}
async function signingKey(secret:string){return crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
function hex(bytes:ArrayBuffer){return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function signTicket(id:string,key:string,now=Date.now()){const exp=Math.floor(now/1000)+3600;const body=id+'.'+exp;const sig=hex(await crypto.subtle.sign('HMAC',await signingKey(key),new TextEncoder().encode(body)));return body+'.'+sig;}
export async function verifyTicket(ticket:string,key:string,now=Date.now()){
 const parts=ticket.split('.');if(parts.length!==3||!/^[A-Za-z0-9_-]{1,250}$/.test(parts[0])||!/^\d+$/.test(parts[1])||!/^[a-f0-9]{64}$/.test(parts[2]))throw new AppError('This preview session is invalid.',403);
 if(Number(parts[1])<now/1000||Number(parts[1])>now/1000+3700)throw new AppError('This preview session has expired. Start a new preview.',403);
 const sig=Uint8Array.from(parts[2].match(/../g)!,x=>parseInt(x,16));const ok=await crypto.subtle.verify('HMAC',await signingKey(key),sig,new TextEncoder().encode(parts[0]+'.'+parts[1]));if(!ok)throw new AppError('This preview session is invalid.',403);return parts[0];
}
