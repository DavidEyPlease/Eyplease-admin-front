import { useEffect, useState } from "react";

import Dropdown from "@/components/common/Inputs/Dropdown";
import { TypographySmall } from "@/components/common/Typography";
import { API_ROUTES } from "@/constants/api";
import { ROLE_LIST } from "@/constants/app";
import useListQuery from "@/hooks/useListQuery";
import { RoleKeys } from "@/interfaces/common";
import { IModule, UIValuePermission } from "@/interfaces/permissions";
import { Card, CardContent } from "@/uishadcn/ui/card";
import { queryKeys } from "@/utils/queryKeys";
import PermissionManagement from "@/components/permissions/PermissionManagement";
import Spinner from "@/components/common/Spinner";
import Button from "@/components/common/Button";
import useRequestQuery from "@/hooks/useRequestQuery";
import { toast } from "sonner";

const PermissionsPage = () => {
    const [role, setRole] = useState<RoleKeys | undefined>(undefined);
    const [permissions, setPermissions] = useState<UIValuePermission[]>([])

    const { request, requestState } = useRequestQuery({
        onSuccess: () => {
            toast.success('Permisos configurados correctamente');
        },
        onError: (error) => {
            toast.error(`Error al guardar los permisos: ${error.message}`);
        }
    })

    const {
        isLoading,
        response: apiResponse,
        onApplyFilters
    } = useListQuery<{ modules: IModule[], permissions: UIValuePermission[] }, { role: RoleKeys | undefined }>({
        endpoint: API_ROUTES.PERMISSIONS.GET_ALL_ACCESS,
        enabled: !!role,
        defaultFilters: { role: undefined },
        customQueryKey: (params) => queryKeys.list(`permissions/get-all-access`, params)
    })

    const onChangePermission = (select: boolean, v: UIValuePermission) => {
        if (select) {
            if (v.nested_modules) {
                const existingPermission = permissions.find(p => p.permissible_id === v.permissible_id);
                if (existingPermission) {
                    // Update existing permission with new nested modules
                    setPermissions(permissions.map(p => p.permissible_id === v.permissible_id ? { ...p, nested_modules: v.nested_modules } : p));
                    return;
                }
            }
            setPermissions([...permissions, v])
        } else {
            setPermissions(permissions.filter(p => p.permissible_id !== v.permissible_id))
        }
    }

    const onSubmit = async () => {
        const endpoint = API_ROUTES.PERMISSIONS.SET_PERMISSIONS_BY_ROLE.replace('{roleKey}', role || '');
        await request(
            'POST',
            endpoint,
            { permissions }
        )
    }

    useEffect(() => {
        if (apiResponse?.permissions) {
            setPermissions(apiResponse.permissions);
        }
    }, [apiResponse]);

    return (
        <Card>
            <CardContent>
                <div className="flex flex-col gap-2 max-w-sm mb-5">
                    <TypographySmall text="Rol" />
                    <Dropdown
                        placeholder="Seleccionar rol"
                        value={role}
                        items={ROLE_LIST}
                        onChange={v => {
                            const selectedRole = v as RoleKeys;
                            setPermissions([]);
                            setRole(selectedRole);
                            onApplyFilters({ role: selectedRole });
                        }}
                    />
                </div>

                {isLoading ? (
                    <Spinner size="sm" color="primary" />
                ) : (
                    <PermissionManagement
                        modules={apiResponse?.modules || []}
                        value={permissions}
                        onChangePermission={onChangePermission}
                    />
                )}

                <div className="text-center mt-5">
                    <Button
                        text='Guardar'
                        type="submit"
                        color="primary"
                        rounded
                        loading={requestState.loading}
                        disabled={!role}
                        onClick={onSubmit}
                    />
                </div>
            </CardContent>
        </Card >
    )
}

export default PermissionsPage;