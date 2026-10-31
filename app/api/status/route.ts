import {apiKey,json} from '../../../lib/server';
export async function GET(){return json({configured:!!apiKey(),service:'YouCam Clothes V4'})}
