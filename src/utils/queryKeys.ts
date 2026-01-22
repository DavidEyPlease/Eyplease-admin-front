import { QueryKey } from '@tanstack/react-query'

/**
 * Funciones de ayuda para generar queryKeys consistentes en toda la aplicación
 */
export const queryKeys = {
    /**
     * Generate a queryKey for a specific entity detail
     */
    detail: (entityName: string, id: string | number): QueryKey => {
        return ['entity', entityName, 'detail', id]
    },

    /**
     * Generate a queryKey for a list of entities with optional parameters
     */
    list: (entityName: string, params?: Record<string, any>): QueryKey => {
        return ['entity', entityName, 'list', params || {}]
    },

    /**
     * Generate a generic queryKey for any operation
     */
    generic: (operation: string, params?: Record<string, any>): QueryKey => {
        return ['operation', operation, params || {}]
    },

    /**
     * Generate a queryKey for a specific resource
     */
    resource: (url: string, params?: Record<string, any>): QueryKey => {
        return ['resource', url, params || {}]
    }
}

/**
 * Use example:
 * 
 * 1. Get user details:
 *    queryKeys.detail('users', 123) => ['entity', 'users', 'detail', 123]
 * 
 * 2. Get product list with filters:
 *    queryKeys.list('products', { category: 'electronics', page: 1 }) => 
 *    ['entity', 'products', 'list', { category: 'electronics', page: 1 }]
 * 
 * 3. Generic operation:
 *    queryKeys.generic('dashboard-stats', { period: 'month' }) =>
 *    ['operation', 'dashboard-stats', { period: 'month' }]
 * 
 * 4. Get resource from API:
 *    queryKeys.resource('/api/config', { version: '1.0' }) =>
 *    ['resource', '/api/config', { version: '1.0' }]
 */