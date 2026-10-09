import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import useAuth from "@/hooks/useAuth";
import {
    Card,
    CardContent,
    CardHeader
} from "@/uishadcn/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/uishadcn/ui/tabs";
import { useState } from "react";
import FormEditProfile from "./components/FormEditProfile";
import ProfilePhoto from "./components/ProfilePhoto";
import ChangePassword from "./components/ChangePassword";
import { IconLock } from "@/components/Svg/IconLock";
import Preferences from "./components/Preferences";
import { IconPreferences } from "@/components/Svg/IconPreferences";

const ProfilePage = () => {
    const [openEdit, setOpenEdit] = useState(false)
    const { user } = useAuth()

    return (
        <div className="grid grid-cols-1 space-y-5">
            <Card>
                <CardHeader className="bg-gradient-to-tr from-[#231f56] via-[#3d0a6e] to-[#f0047f] h-40" />
                <CardContent>
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        {user && <ProfilePhoto user={user} />}
                        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3 pt-2 sm:flex-1">
                            <div className="flex min-w-0 flex-col justify-end space-y-1">
                                <p className="text-2xl break-words">{user?.name}</p>
                            </div>
                            <Button
                                text='Editar perfil'
                                type="submit"
                                color="primary"
                                variant="outline"
                                rounded
                                onClick={() => setOpenEdit(true)}
                            />
                            <Modal open={openEdit} onOpenChange={setOpenEdit} title="Editar perfil">
                                {user && <FormEditProfile user={user} onSuccess={() => setOpenEdit(false)} />}
                            </Modal>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Tabs defaultValue="user_preferences" className="w-full">
                <TabsList>
                    <TabsTrigger value="user_preferences">
                        <div className="flex items-center gap-x-2">
                            <IconPreferences />
                            Preferencias
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="change_password">
                        <div className="flex items-center gap-x-2">
                            <IconLock />
                            Seguridad
                        </div>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="user_preferences">
                    {user && <Preferences user={user} />}
                </TabsContent>
                <TabsContent value="change_password">
                    <ChangePassword />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ProfilePage;