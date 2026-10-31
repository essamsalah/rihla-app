import {env} from 'cloudflare:workers';
import {AppError} from './youcam';
export function apiKey(){return ((env as unknown as Record<string,string>).YOUCAM_API_KEY||'').trim()}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export function handleError(error:unknown){return json({error:error instanceof AppError?error.message:'The preview service encountered a problem. Please try again.'},error instanceof AppError?error.status:500)}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new AppError('Please use the preview from Rihla.',403)}
