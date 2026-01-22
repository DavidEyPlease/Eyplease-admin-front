import { IGenericFilter } from "@/interfaces/common"

export const convertFiltersToQueryString = (filters: IGenericFilter): string => {
    let queryString = ''

    for (const [key, value] of Object.entries(filters)) {
        // if (Array.isArray(value) && value.length > 0) {
        //     value.forEach((item: ItemValue) => {
        //         queryString += `${key}=${item?.id || item}&`
        //     })
        // }

        // if (key === 'dates') {
        //     const { field, startDate, endDate } = value as FilterValues['dates']
        //     if (field && startDate && endDate) {
        //         queryString += `dateFilter[field]=${field}&`
        //         queryString += `dateFilter[startDate]=${dateToStartOfDay(startDate)}&`
        //         queryString += `dateFilter[endDate]=${dateToEndOfDay(endDate)}&`
        //     }
        // }

        if (!['object', 'number'].includes(typeof value) && value) {
            queryString += `${key}=${value}&`
        }

        if (typeof value === 'number') {
            queryString += `${key}=${key !== 'page' && [0, 1].includes(value) ? Boolean(value) : value}&`
        }
    }
    return queryString.slice(0, -1)
}

export const objectToQueryParams = (obj: Record<string, any>): string => {
    const params = new URLSearchParams()
    const { filters, ...rest } = obj
    Object.entries({ ...rest, ...(filters ? filters : {}) }).forEach(([key, value]) => {
        params.append(key, value as string)
    })
    return params.toString()
}

export const formatCurrency = (value = 0, currency = 'USD') => {
    if (!value) return '$0.00'
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    })
}

export const uploadS3 = async (file: File, url: string) => {
    await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'multipart/form-data' },
    });
}

export const getFileType = (mimetype: string) => {
    const type = mimetype.split('/')[1]
    return type === 'jpeg' ? 'jpg' : type
}

export const booleanToText = (value: boolean) => (value ? 'Si' : 'No')

export const replaceRecordIdInPath = (path: string, recordId: string) => path.replace(':id', recordId).replace('{id}', recordId)

export const slugify = (text: string) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

export const getInitialLetters = (name: string) => {
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
}

export const isImage = (fileExtension: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg']
    return imageExtensions.includes(fileExtension.toLowerCase())
}
export const setVariablesInString = (str: string, variables: Record<string, string>) => {
    // Replace ${variable} in the string with the corresponding value from the variables object
    return str.replace(/\${([^}]*)}/g, (r, k) => variables[k] || '')
}