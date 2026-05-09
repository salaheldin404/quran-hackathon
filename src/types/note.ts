export interface Note {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  ranges?: string[];
  source?: string
}

export interface NoteInput {
  body: string;
  saveToQR: boolean;
  ranges?: string[];
}
