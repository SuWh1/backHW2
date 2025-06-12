export interface Task {
  id: string;
  title: string;
  description: string;
  owner_id?: string;
}
  
export interface User {
  id: string;
  username: string;
}

export interface GeminiResponse {
  response: string;
}