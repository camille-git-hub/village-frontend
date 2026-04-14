export type ChatMessage = {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string | Date;
  read: boolean;
};

export type ChatParticipant = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type Chat = {
  _id: string;
  participantIds: ChatParticipant[];
  messages: ChatMessage[];
  createdAt?: string;
  updatedAt?: string;
};