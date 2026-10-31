import type {WardrobeItem} from './trip';
export const garmentCategory:Record<string,string>={top:'upper_body',bottom:'lower_body',layer:'outer',shoes:'shoes',outfit:'full_body'};
export function previewQueue(items:WardrobeItem[]){const order:Record<string,number>={outfit:0,bottom:1,top:2,layer:3,shoes:4};return items.filter(i=>i.category!=='accessory').sort((a,b)=>order[a.category]-order[b.category]);}
export type ChainState={queue:WardrobeItem[];index:number;activeTicket:string;previousTicket:string;lastUrl:string;completedIds:string[]};
export class ChainTaskError extends Error {terminal:boolean;constructor(message:string,terminal=false){super(message);this.terminal=terminal}}
export async function runPreviewChain(state:ChainState,io:{create:(item:WardrobeItem,previousTicket:string)=>Promise<string>;poll:(ticket:string)=>Promise<string|null>;progress:(state:ChainState)=>void}){
 while(state.index<state.queue.length){
  if(!state.activeTicket){state.activeTicket=await io.create(state.queue[state.index],state.previousTicket);io.progress(state);}
  let url:string|null;try{url=await io.poll(state.activeTicket)}catch(e){if(e instanceof ChainTaskError&&e.terminal)state.activeTicket='';throw e}
  if(!url)return false;
  state.lastUrl=url;state.completedIds.push(state.queue[state.index].id);state.previousTicket=state.activeTicket;state.activeTicket='';state.index++;io.progress(state);
 }
 return true;
}
