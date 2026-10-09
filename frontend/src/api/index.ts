import type { Texture } from 'three';

export type Experience = 'missions' | 'live-earth' | 'basic';
export type Body = {
  id: string; name: string; type: string; parentId: string | null; experience: Experience; summary: string;
  facts: { radiusKm: number; distanceFromParentMillionKm: number; orbitalPeriodDays: number; rotationPeriodHours: number; axialTiltDeg: number; meanSurfaceTempC: number | null };
  visual: { colorHex: string; hasRings: boolean };
};
export type Tool = { id: string; bodyId: string; name: string; modelType: 'rover'|'helicopter'|'lander'|'lunar-rover'|'instrument'; year: number; agency: string; summary: string; facts: string[]; location: { site: string; latDeg: number; lonDeg: number }; images: { top: Img; left: Img; right: Img }; iconUrl?: string; modelUrl?: string };
export type Img = { url: string; alt: string; caption: string; credit: string };
export type QuizQuestion = { id: string; prompt: string; options: { id: string; text: string }[]; difficulty: string; relatedToolId?: string };
const img = (title: string, color: string): Img => ({ url: `https://images.unsplash.com/photo-${color}?auto=format&fit=crop&w=900&q=80`, alt: title, caption: `${title} field image`, credit: 'NASA / Unsplash editorial placeholder' });

const mockBodies: Body[] = [
  ['sun','Sun','star',null,'basic','The star at the heart of our system. Its light drives every world you see.',696340,0,0,609.12,7.25,5500,'#ffb649',false],
  ['mercury','Mercury','planet','sun','basic','A swift, cratered world with extreme temperature swings.',2440,57.9,88,1407.6,7.0,167,'#a99d8b',false],
  ['venus','Venus','planet','sun','basic','A cloud-wrapped world with a runaway greenhouse atmosphere.',6052,108.2,224.7,-5832.5,177.4,464,'#d8a76b',false],
  ['earth','Earth','planet','sun','live-earth','Our ocean world, layered with living systems and changing weather.',6371,149.6,365.2,23.9,23.4,15,'#4ab8c3',false],
  ['moon','Moon','moon','earth','missions','Earth’s bright companion and a record of human exploration.',1737,0.384,27.3,655.7,6.7,-20,'#b6c7d9',false],
  ['mars','Mars','planet','sun','missions','A cold desert world where robotic explorers search for ancient water.',3390,227.9,687,-24.6,25.2,-63,'#d85d3f',false],
  ['jupiter','Jupiter','planet','sun','basic','A banded giant with storms larger than Earth.',69911,778.5,4332.6,9.9,3.1,-110,'#d7ad84',false],
  ['saturn','Saturn','planet','sun','basic','A pale giant framed by one of the solar system’s great signatures: rings.',58232,1434,10759,10.7,26.7,-140,'#dbc486',true],
  ['uranus','Uranus','planet','sun','basic','An ice giant rolling through space on its side.',25362,2871,30687,-17.2,97.8,-195,'#9edbe1',true],
  ['neptune','Neptune','planet','sun','basic','A deep-blue world with supersonic winds.',24622,4495,60190,16.1,28.3,-200,'#4a81d9',false],
  ['pluto','Pluto','dwarf','sun','basic','A small, bright-hearted world at the edge of the known system.',1188,5906,90560,153.3,119.6,-229,'#c69d86',false],
].map(([id,name,type,parentId,experience,summary,radiusKm,distance,orbit,rotation,tilt,temp,color,hasRings]) => ({ id, name, type, parentId, experience, summary, facts:{radiusKm:Number(radiusKm),distanceFromParentMillionKm:Number(distance),orbitalPeriodDays:Number(orbit),rotationPeriodHours:Number(rotation),axialTiltDeg:Number(tilt),meanSurfaceTempC:temp === null ? null : Number(temp)}, visual:{colorHex:String(color),hasRings:Boolean(hasRings)} })) as Body[];

const mockTools: Tool[] = [
  { id:'perseverance', bodyId:'mars', name:'Perseverance rover', modelType:'rover', year:2021, agency:'NASA / JPL', summary:'A mobile geology lab collecting samples in Jezero Crater.', facts:['Searches for signs of ancient microbial life','Caches carefully selected rock samples','Carries the Ingenuity helicopter'], location:{site:'Jezero Crater',latDeg:18.44,lonDeg:77.45}, images:{top:img('Perseverance on Mars','1505664063603-28e38b204126'),left:img('Mars rover tracks','1446776877081-d282a0f896e2'),right:img('Jezero panorama','1614728263952-84ea256f9679')} },
  { id:'ingenuity', bodyId:'mars', name:'Ingenuity helicopter', modelType:'helicopter', year:2021, agency:'NASA / JPL', summary:'The first aircraft to achieve powered, controlled flight on another planet.', facts:['Completed 72 flights','Used carbon-fiber rotor blades','Scouted terrain for Perseverance'], location:{site:'Jezero Crater',latDeg:18.44,lonDeg:77.45}, images:{top:img('Ingenuity flight','1614728263952-84ea256f9679'),left:img('Rotor shadow','1505664063603-28e38b204126'),right:img('Red planet flight','1446776877081-d282a0f896e2')} },
  { id:'apollo-lrv', bodyId:'moon', name:'Apollo lunar rover', modelType:'lunar-rover', year:1971, agency:'NASA', summary:'An electric rover that extended the reach of astronauts across the lunar surface.', facts:['First driven on the Moon by Apollo 15','Top speed about 18 km/h','Folded into the lunar module'], location:{site:'Hadley–Apennine',latDeg:26.13,lonDeg:3.63}, images:{top:img('Lunar rover','1446776877081-d282a0f896e2'),left:img('Apollo surface','1614728263952-84ea256f9679'),right:img('Moon horizon','1505664063603-28e38b204126')} },
];

const mockQuestions: Record<string, QuizQuestion[]> = {
  mars:[{id:'m1',prompt:'Which rover is exploring Jezero Crater?',options:[{id:'a',text:'Perseverance'},{id:'b',text:'Curiosity'},{id:'c',text:'Spirit'}],difficulty:'warm-up',relatedToolId:'perseverance'},{id:'m2',prompt:'What is Ingenuity?',options:[{id:'a',text:'A lander'},{id:'b',text:'A helicopter'},{id:'c',text:'A telescope'}],difficulty:'orbit',relatedToolId:'ingenuity'}],
  moon:[{id:'q1',prompt:'What powered the Apollo lunar rover?',options:[{id:'a',text:'A small electric motor'},{id:'b',text:'A chemical rocket'},{id:'c',text:'A sail'}],difficulty:'warm-up',relatedToolId:'apollo-lrv'}],
  earth:[{id:'e1',prompt:'Which layer helps map active fires in this explorer?',options:[{id:'a',text:'NASA satellite data'},{id:'b',text:'Deep ocean sonar'},{id:'c',text:'A telescope mirror'}],difficulty:'field note'}]
};

const mockScript = {speaker:'CAPCOM',lines:[{id:'1',text:'Every point of light is a place, a story, or a question waiting to be asked.'},{id:'2',text:'Take the controls. Choose a world, then follow the evidence.'}],endPrompt:'Tap to continue'};

const wait = (ms=180) => new Promise(r => setTimeout(r, ms));
export async function getDatasets(id:string){ await wait(); return [{id:`${id}-catalog`,title:`${id[0].toUpperCase()+id.slice(1)} mission archive`,description:'Curated datasets and imagery from NASA open catalogs.',url:'https://data.nasa.gov/',hostedAt:'NASA Open Data',catalog:'NASA'}]; }
export async function getImagery(){ await wait(260); return {textureUrl:'',layerId:'worldview',imageryDate:'2026-10-08',fallback:true,worldviewUrl:'https://worldview.earthdata.nasa.gov/',credit:'NASA GIBS / Worldview'}; }
export async function getFires(){ await wait(); return {source:'NASA FIRMS',days:1,generatedAt:'2026-10-09T08:20:00Z',totalDetections:284,points:[{lat:34,lon:-118,frp:60},{lat:-23,lon:145,frp:42},{lat:3,lon:28,frp:22}],credit:'NASA FIRMS'}; }
export async function getClimate(lat:number,lon:number){ await wait(); return {location:`${lat.toFixed(1)}°, ${lon.toFixed(1)}°`,period:'7 days',units:{tempC:'°C',solar:'W/m²',precip:'mm'},daily:[1,2,3,4,5,6,7].map((d,i)=>({date:`Day ${d}`,tempC:18+i%3,solar:220+i*8,precip:i===4?3.2:0})),summary:{avgTempC:19.4,avgSolar:244,totalPrecip:3.2},links:{worldview:'https://worldview.earthdata.nasa.gov/',earthdataSearch:'https://search.earthdata.nasa.gov/'},credit:'NASA Earthdata'}; }
export async function searchData(q:string){ await wait(); return [{id:'data-1',title:`${q} Earth observation collection`,summary:'Satellite observations for atmospheric and surface change.',provider:'NASA Earthdata',timeStart:'2023-01-01',timeEnd:'2026-10-09',earthdataSearchUrl:'https://search.earthdata.nasa.gov/'}]; }
export async function getCredits(){ await wait(); return [{source:'NASA GIBS / Worldview',text:'Earth imagery and data links connect to NASA open services.',url:'https://worldview.earthdata.nasa.gov/'},{source:'NASA Open Data',text:'Mission archives and educational references.',url:'https://data.nasa.gov/'}]; }
export function apiOrigin(){ return (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/,''); }

// ---------------------------------------------------------------------------
// Live API. Bodies, tools, the astronaut script and the Mars/Moon quizzes come
// from the back-end. Earth's live layers, datasets and credits are not served
// by the back-end yet, so those calls still return the fixtures above.
// Set VITE_USE_MOCKS=true to skip the back-end entirely; the fixtures are also
// used automatically when the back-end cannot be reached at load time.
// ---------------------------------------------------------------------------
type ApiBody = Omit<Body, 'experience' | 'facts'> & { hasData: boolean; facts: Omit<Body['facts'], 'meanSurfaceTempC'> & { meanSurfaceTempC?: number | null } };
type ApiBodyDetail = ApiBody & { tools: { id: string }[] };

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
const QUIZ_BODIES = ['mars', 'moon'];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiOrigin()}/api${path}`, { signal: AbortSignal.timeout(8000), ...init });
  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new Error(problem?.error?.message ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// The back-end marks deep content with hasData; the UI thinks in "experiences".
function toBody(api: ApiBody): Body {
  const { hasData, ...rest } = api;
  return {
    ...rest,
    experience: hasData ? 'missions' : api.id === 'earth' ? 'live-earth' : 'basic',
    facts: { ...api.facts, meanSurfaceTempC: api.facts.meanSurfaceTempC ?? null },
  };
}

// Image URLs arrive as paths relative to the API origin.
const withOrigin = (image: Img): Img => ({ ...image, url: image.url.startsWith('/') ? `${apiOrigin()}${image.url}` : image.url });
const toTool = (tool: Tool): Tool => ({ ...tool, ...(tool.modelUrl ? { modelUrl: tool.modelUrl.startsWith('/') ? `${apiOrigin()}${tool.modelUrl}` : tool.modelUrl } : {}), ...(tool.iconUrl ? { iconUrl: tool.iconUrl.startsWith('/') ? `${apiOrigin()}${tool.iconUrl}` : tool.iconUrl } : {}), images: { top: withOrigin(tool.images.top), left: withOrigin(tool.images.left), right: withOrigin(tool.images.right) } });

async function loadBodies(): Promise<{ live: boolean; bodies: Body[] }> {
  if (useMocks) return { live: false, bodies: mockBodies };
  try {
    const data = await request<{ bodies: ApiBody[] }>('/bodies');
    return { live: true, bodies: data.bodies.map(toBody) };
  } catch (err) {
    console.warn('Solar System Explorer API is unreachable; using built-in mock data.', err);
    return { live: false, bodies: mockBodies };
  }
}

const loaded = await loadBodies();
/** True when the data on screen comes from the back-end rather than the fixtures. */
export const isLive = loaded.live;
export const bodies: Body[] = loaded.bodies;

const earthLayers = [{id:'fires',label:'Active fires'},{id:'climate',label:'Climate probe'},{id:'search',label:'Find NASA data'}];

export async function getBodies(){ return bodies; }
export async function getBody(id:string){
  const liveLayers = id==='earth' ? earthLayers : [];
  if(!isLive){ await wait(); return { body:bodies.find(b=>b.id===id)!, tools:mockTools.filter(t=>t.bodyId===id), liveLayers }; }
  const detail = await request<ApiBodyDetail>(`/bodies/${encodeURIComponent(id)}`);
  const tools = await Promise.all(detail.tools.map(t => request<Tool>(`/tools/${encodeURIComponent(t.id)}`).then(toTool)));
  return { body:toBody(detail), tools, liveLayers };
}
export async function getScript(){
  if(!isLive){ await wait(220); return mockScript; }
  return request<typeof mockScript>('/astronaut/script');
}
export async function getQuiz(id:string): Promise<QuizQuestion[]> {
  if(!isLive || !QUIZ_BODIES.includes(id)){ await wait(); return mockQuestions[id] ?? []; }
  return (await request<{ questions: QuizQuestion[] }>(`/quiz/${id}`)).questions;
}
export async function answerQuiz(bodyId:string,questionId:string,optionId:string): Promise<{correct:boolean;correctOptionId:string;explanation:string}> {
  if(!isLive || !QUIZ_BODIES.includes(bodyId)){ await wait(140); const q=(mockQuestions[bodyId]??[]).find(x=>x.id===questionId)!; const correct=q?.options[0]?.id ?? 'a'; return {correct:optionId===correct,correctOptionId:correct,explanation:optionId===correct?'Correct — you followed the evidence.':'Not quite. The highlighted answer is the one supported by this mission record.'}; }
  return request(`/quiz/${bodyId}/answer`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({questionId,optionId}) });
}
