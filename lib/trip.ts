export type Category = 'top'|'bottom'|'layer'|'shoes'|'accessory'|'outfit';
export type WardrobeItem = {id:string;name:string;category:Category;color:string;sample:boolean;photo?:string};
export type Stop = {id:string;name:string;arabic:string;day:string;title:string;description:string;tip:string;requires:Category[]};
export const CATEGORIES:Record<Category,string>={top:'Tops',bottom:'Bottoms',layer:'Layers',shoes:'Shoes',accessory:'Accessories',outfit:'Full outfits'};
export const STOPS:Stop[]=[
{id:'amman',name:'Amman',arabic:'عمّان',day:'Day 1',title:'Slow mornings. City wandering.',description:'Cafés, galleries and a walk through the city.',tip:'Start with an outfit you already enjoy walking in. Add a layer to your plan if you expect a cooler evening.',requires:['top','bottom','shoes']},
{id:'petra',name:'Petra',arabic:'البتراء',day:'Day 2',title:'A day among rose-colored stone.',description:'A walking day, with time to pause and explore.',tip:'Plan comfortable coverage and familiar walking shoes. Check the forecast and site guidance before your visit.',requires:['top','bottom','shoes']},
{id:'wadirum',name:'Wadi Rum',arabic:'وادي رم',day:'Day 3',title:'Desert light. An evening outside.',description:'An afternoon arrival and an evening at camp.',tip:'Include a layer in your shortlist for the evening. Ask your camp about the conditions for your actual dates.',requires:['top','bottom','shoes','layer']}
];
export const STARTER:WardrobeItem[]=[
{id:'linen',photo:'/samples/linen.jpg',name:'Easy linen shirt',category:'top',color:'#e6d8bb',sample:true},
{id:'tee',photo:'/samples/tee.jpg',name:'Everyday cotton tee',category:'top',color:'#f1efe5',sample:true},
{id:'trousers',photo:'/samples/trousers.jpg',name:'Relaxed olive trousers',category:'bottom',color:'#899175',sample:true},
{id:'jeans',photo:'/samples/jeans.jpg',name:'Favorite blue jeans',category:'bottom',color:'#849ba9',sample:true},
{id:'jacket',photo:'/samples/jacket.jpg',name:'Light overshirt',category:'layer',color:'#b77b59',sample:true},
{id:'knit',photo:'/samples/knit.jpg',name:'Soft evening knit',category:'layer',color:'#b4aa9e',sample:true},
{id:'walkers',photo:'/samples/walkers.jpg',name:'Broken-in walking shoes',category:'shoes',color:'#b9ad99',sample:true},
{id:'scarf',photo:'/samples/scarf.jpg',name:'Light scarf',category:'accessory',color:'#b8a990',sample:true}
];
export function restoreItemPhoto(item:WardrobeItem):WardrobeItem{return {...item,photo:item.sample?STARTER.find(s=>s.id===item.id)?.photo:undefined};}
export type Assignments = Record<string,string[]>;
export function missingForStop(stop:Stop,ids:string[],items:WardrobeItem[]):Category[]{
 const selected=items.filter(i=>ids.includes(i.id));
 return stop.requires.filter(c=>!selected.some(i=>i.category===c||(i.category==='outfit'&&(c==='top'||c==='bottom'))));
}
export function packing(items:WardrobeItem[],assignments:Assignments){
 return items.filter(i=>STOPS.some(s=>(assignments[s.id]||[]).includes(i.id))).map(i=>({...i,stops:STOPS.filter(s=>(assignments[s.id]||[]).includes(i.id)).map(s=>s.name)}));
}
export function assignItem(ids:string[],item:WardrobeItem,items:WardrobeItem[]):string[]{
 if(ids.includes(item.id))return ids.filter(id=>id!==item.id);
 return [...ids.filter(id=>{const old=items.find(x=>x.id===id);if(!old)return false;if(old.category===item.category)return false;if(item.category==='outfit'&&['top','bottom'].includes(old.category))return false;if(old.category==='outfit'&&['top','bottom'].includes(item.category))return false;return true}),item.id];
}
export function packingText(items:WardrobeItem[],assignments:Assignments,checked:string[],date:string){
 return ['RIHLA — ONE BAG FOR JORDAN',date?'Starts '+date:'Dates not set','Amman → Petra → Wadi Rum','',...STOPS.flatMap(s=>[s.day+' · '+s.name,...items.filter(i=>(assignments[s.id]||[]).includes(i.id)).map(i=>'  • '+i.name+(i.sample?' [sample item]':'')),...(missingForStop(s,assignments[s.id]||[],items).length?['  Still to plan: '+missingForStop(s,assignments[s.id]||[],items).map(c=>CATEGORIES[c]).join(', ')]:[]),'']), 'PACK ONCE',...packing(items,assignments).map(i=>(checked.includes(i.id)?'[x] ':'[ ] ')+i.name+' — '+i.stops.join(', ')), '', 'Appearance previews do not guarantee fit or outdoor suitability. Check the forecast, site guidance and your own needs before traveling.'].join('\n');
}
export function addPieces(ids:string[],chosen:WardrobeItem[],items:WardrobeItem[]){return chosen.reduce((all,i)=>assignItem(all.filter(id=>id!==i.id),i,items),ids);}
