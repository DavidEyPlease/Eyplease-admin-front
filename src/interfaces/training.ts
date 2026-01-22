import { IBaseDBProperties } from "./common";
import { EypleaseFile } from "./files"
import { IPlan } from "./plans";

export const TrainingCategoryTypes = {
    SALES: 'sales',
    MARKETING: 'marketing',
} as const;
export type TrainingCategoryTypes = typeof TrainingCategoryTypes[keyof typeof TrainingCategoryTypes];

export interface ITrainingCategory {
    id: string
    name: string
    slug: TrainingCategoryTypes
}

export interface ITraining extends IBaseDBProperties {
    title: string
    category: ITrainingCategory
    plans: IPlan[]
    files: EypleaseFile[]
}

export interface ITrainingUpdate {
    file_cover?: string
    title?: string
    category_id?: string
    plan_id?: string
}