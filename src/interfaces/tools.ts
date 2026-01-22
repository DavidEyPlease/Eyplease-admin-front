// import { EypleaseFile } from "./files"

export const ToolSectionTypes = {
    STAY_INFORMED: 'stay_informed',
    LEARN: 'learn',
    EXPLAIN: 'explain',
    PRODUCTS: 'products',
    PROPOSALS: 'proposals',
    GET_STARTED: 'get_started',
}
export type ToolSectionTypes = typeof ToolSectionTypes[keyof typeof ToolSectionTypes];


// export interface ITool {
//     id: string
//     title: string
//     description: string | null
//     section: ToolSectionTypes
//     created_at: Date
//     slug: string
//     files: EypleaseFile[]
// }

// export interface IToolsFilters {
//     section: ToolSectionTypes
// }