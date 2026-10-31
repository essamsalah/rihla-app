import {AppError,makeYoucam,signTicket,verifyTicket} from '../../../lib/youcam';
import {apiKey,json,handleError,sameOrigin} from '../../../lib/server';
export async function POST(req:Request){try{
 sameOrigin(req);const key=apiKey();if(!key)throw new AppError('Outfit previews are not connected yet. You can still plan and pack your wardrobe.',503);
 const size=Number(req.headers.get('content-length')||0);if(size>18*1024*1024)throw new AppError('These images are too large.',413);
 const form=await req.formData();if(form.get('consent')!=='yes')throw new AppError('Please confirm that YouCam may process these photos.');
 const person=form.get('person'),garment=form.get('garment'),previous=form.get('sourceTicket');
 if(!(garment instanceof File))throw new AppError('Add a garment photo.');
 if(previous&&person)throw new AppError('Choose one preview source.');
 const client=makeYoucam(key);let id:string;
 if(typeof previous==='string'&&previous){const previousId=await verifyTicket(previous,key);id=await client.createFromTask(previousId,garment,String(form.get('category')));}
 else{if(!(person instanceof File))throw new AppError('Add your photo.');id=await client.create(person,garment,String(form.get('category')));}
 return json({ticket:await signTicket(id,key),status:'running'});
}catch(e){return handleError(e)}}
export async function GET(req:Request){try{const key=apiKey();if(!key)throw new AppError('Outfit previews are not connected yet.',503);const ticket=new URL(req.url).searchParams.get('ticket')||'';const id=await verifyTicket(ticket,key);return json(await makeYoucam(key).status(id));}catch(e){return handleError(e)}}
