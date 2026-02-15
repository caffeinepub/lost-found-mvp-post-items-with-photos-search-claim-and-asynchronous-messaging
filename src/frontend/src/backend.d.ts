import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Conversation {
    id: string;
    itemId: string;
    participants: Array<Principal>;
    messages: Array<Message>;
}
export type Time = bigint;
export interface Item {
    id: string;
    status: Status;
    title: string;
    createdAt: Time;
    createdBy: Principal;
    description: string;
    itemType: ItemType;
    category: string;
    photo?: ExternalBlob;
    dateTime: string;
    location: string;
}
export interface Message {
    id: string;
    content: string;
    sender: Principal;
    timestamp: Time;
}
export interface FeedbackEntry {
    id: bigint;
    createdAt: Time;
    user: Principal;
    message: string;
}
export interface UserProfile {
    name: string;
}
export enum ItemType {
    found = "found",
    lost = "lost"
}
export enum Status {
    missing = "missing",
    claimed = "claimed",
    returned = "returned"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createConversation(itemId: string): Promise<string>;
    createItem(itemType: ItemType, title: string, description: string, category: string, location: string, dateTime: string, photo: ExternalBlob | null): Promise<string>;
    getAllFeedback(): Promise<Array<FeedbackEntry>>;
    getCallerFeedback(): Promise<Array<FeedbackEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(conversationId: string): Promise<Conversation | null>;
    getItem(itemId: string): Promise<Item | null>;
    getUserConversations(user: Principal): Promise<Array<Conversation>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchItems(keyword: string, category: string | null, itemType: ItemType | null): Promise<Array<Item>>;
    sendMessage(conversationId: string, message: string): Promise<void>;
    submitFeedback(message: string): Promise<void>;
    updateItemStatus(itemId: string, newStatus: Status): Promise<void>;
}
