export type ViewState = 'LOADING'|'INTRO'|'AWAIT_TAP'|'EXPLORE'|'FOCUS'|'TOOL_DETAIL';
export type State = { view: ViewState; selectedBodyId: string|null; selectedToolId: string|null; quizOpen: boolean; reducedMotion: boolean };
export const state: State = { view:'LOADING', selectedBodyId:null, selectedToolId:null, quizOpen:false, reducedMotion:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false };
const listeners = new Set<(s:State)=>void>();
export function subscribe(fn:(s:State)=>void){ listeners.add(fn); return ()=>listeners.delete(fn); }
export function transition(view:ViewState, patch:Partial<State>={}){ Object.assign(state,{view,...patch}); listeners.forEach(fn=>fn(state)); }
