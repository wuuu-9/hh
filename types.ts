
export interface OrnamentData {
  id: string;
  position: [number, number, number];
  color: string;
  type: 'gold' | 'red' | 'emerald';
  label: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
