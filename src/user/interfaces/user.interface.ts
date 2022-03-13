import { Document } from 'mongoose';

export interface User extends Document {
   username: string;
   password: string;
   online: boolean;
   messages: Message[];
   notifications: Notification[];
}

export interface Message {
    text: string;
    to: string;
    from: string;
}

export interface Notification {
    to: string;
    from: string;
}
