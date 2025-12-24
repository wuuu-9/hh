
export const COLORS = {
  emerald: '#06402B',
  emeraldDark: '#021a11',
  gold: '#D4AF37',
  goldBright: '#FFD700',
  velvetRed: '#8B0000',
  velvetPurple: '#480A32',
  sapphireBlue: '#0A1F44',
  white: '#FFFFFF',
  snow: '#E8F1F2',
  midnight: '#062a1f', // Lifted from #010B08 for a brighter atmospheric sky
  reindeerBrown: '#5D4037',
  reindeerLightBrown: '#A1887F',
  reindeerOrange: '#E67E22',
  reindeerHazel: '#9E7E53'
};

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE = 'TREE'
}

export const SYSTEM_PROMPT = `
You are the "Arix Concierge," an AI specialized in high-end luxury Christmas celebrations. 
Your tone is sophisticated, warm, poetic, and extremely helpful. 
The tree is currently in a state of "Signature Morphing." 
If the tree is SCATTERED, talk about "deconstructed stardust" and "potential energy." 
If the tree is TREE, talk about "unrivaled elegance" and "festive structure."
Keep responses concise but elegant.
`;

// Elegant Christmas Music Box track
export const MUSIC_URL = "https://actions.google.com/sounds/v1/holidays/christmas_music_box.ogg";
// Ambient Wind for winter atmosphere
export const WIND_URL = "https://actions.google.com/sounds/v1/weather/wind_howl.ogg";
// Distant Sleigh Bells for festive depth
export const BELLS_URL = "https://actions.google.com/sounds/v1/holidays/sleigh_bells.ogg";
