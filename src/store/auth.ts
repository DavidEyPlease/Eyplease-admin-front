import { create } from 'zustand'

import { SIDEBAR_ITEMS } from '@/constants/app'
import { IAuthUser, IAuthUserPermissions } from '@/interfaces/auth'
import { GlobalUtilData, MenuItem, RoleKeys } from '@/interfaces/common'

type State = {
    user: IAuthUser | null
    permissions: IAuthUserPermissions
    utilData: GlobalUtilData
    sidebarMenu: MenuItem[]
}

type Actions = {
    setUser: (user: IAuthUser) => void
    logout: () => void
    setUtilData: (utilData: GlobalUtilData) => void
    setAuth: (user: IAuthUser) => void
}

const useAuthStore = create<State & Actions>((set) => ({
    user: null,
    sidebarMenu: [],
    permissions: [],
    utilData: {
        plans: [],
        task_types: [],
        task_statuses: [],
        designers: [],
        newsletters: [],
        training_categories: []
    },
    setAuth: (user: IAuthUser) => set(() => {
        const { role: { permissions, ...restRole }, ...authUser } = user

        const permissionKeys = permissions.map(p => p.permissible_key)

        const sidebarMenu = SIDEBAR_ITEMS.filter(item => {
            if (!item.requiredPermission || user.role?.role_key === RoleKeys.SUPER_ADMIN) return true
            return permissionKeys.some(key => item.permissionKeys?.includes(key))
        }).map(item => {
            if (item.children && user.role?.role_key !== RoleKeys.SUPER_ADMIN) {
                const children = item.children.filter(child => {
                    if (!child.requiredPermission) return true
                    return permissionKeys.some(key => child.permissionKeys?.includes(key))
                })
                return { ...item, children }
            }
            return item
        })
        return {
            user: { ...authUser, role: { ...restRole, permissions } },
            sidebarMenu,
            permissions
        }
    }),
    setUser: (user: IAuthUser) => set({ user }),
    logout: () => set({ user: null }),
    setUtilData: (utilData: GlobalUtilData) => set({ utilData }),
}))

export default useAuthStore