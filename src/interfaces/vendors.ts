import { FileUrls } from "./common";

export type NetworkRankGroupType = 'unity' | 'directors'

export interface INetworkPerson {
    id: string;
    name: string;
    account: string;
    country: string;
    photo: FileUrls
    rank: string
    isClientActive: boolean;
    isClient: boolean;
    created_at: Date;
}