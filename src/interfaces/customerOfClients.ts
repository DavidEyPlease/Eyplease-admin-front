import { Gender } from "./common";
import { EypleaseFile } from "./files";

export interface CustomerOfClient {
    id: string;
    name: string;
    photo: EypleaseFile
    gender: Gender
}