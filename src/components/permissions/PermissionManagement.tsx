import { Card, CardContent } from "@/uishadcn/ui/card";
import SwitchInput from "../common/Inputs/Switch";
import { IModule, UIValuePermission } from "@/interfaces/permissions";
import { cn } from "@/lib/utils";

interface PermissionManagementProps {
    modules: IModule[]
    value: UIValuePermission[]
    onChangePermission: (select: boolean, v: UIValuePermission) => void
}

const PermissionManagement = ({ modules, value, onChangePermission }: PermissionManagementProps) => {
    return (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {(modules || []).map(module => (
                <Card className="h-max" key={module.key}>
                    <CardContent className="grid gap-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{module.name}</p>
                            <SwitchInput
                                id={module.key}
                                checked={value.findIndex(a => a.permissible_id === module.id && a.permissible_type === "module") !== -1}
                                onCheckedChange={(select) => onChangePermission(select, { permissible_id: module.id, permissible_type: "module", can_view: true })}
                            />
                        </div>
                        {module.sub_modules.map(permission => (
                            <div key={permission.key} className={cn('grid gap-y-2', !!permission.nested_modules.length && 'pb-2 border-b border-gray-200')}>
                                <SwitchInput
                                    id={permission.key}
                                    label={permission.name}
                                    checked={value.findIndex(a => a.permissible_id === permission.id && a.permissible_type === "sub_module") !== -1}
                                    onCheckedChange={(select) => onChangePermission(select, { permissible_id: permission.id, permissible_type: "sub_module", can_view: true })}
                                />
                                <div className="grid ms-5 gap-y-2">
                                    {permission.nested_modules.map(nested => {
                                        const access = value.find(a => a.permissible_id === permission.id && a.permissible_type === "sub_module")
                                        return (
                                            <SwitchInput
                                                key={nested.key}
                                                disabled={!access}
                                                id={nested.key}
                                                label={nested.label}
                                                checked={access && (access?.nested_modules || []).findIndex(n => n.key === nested.key) !== -1}
                                                onCheckedChange={(e) => onChangePermission(e, { permissible_id: permission.id, permissible_type: "sub_module", can_view: true, nested_modules: [...(access?.nested_modules || []), { key: nested.key, label: nested.label }] })}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default PermissionManagement;