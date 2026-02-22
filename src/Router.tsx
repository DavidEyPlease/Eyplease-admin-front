import { useEffect } from "react"

import { Navigate, Route, Routes } from "react-router"

import MainLayout from "./layouts/MainLayout"
import SignInPage from "./pages/Auth/SignIn"
import ForgotPasswordPage from "./pages/Auth/ForgotPassword"

import useAuth from "./hooks/useAuth"
import DashboardPage from "./pages/Dashboard"
import { APP_ROUTES } from "./constants/app"
import VerificationCodePage from "./pages/Auth/VerificationCode"
import ProfilePage from "./pages/Profile"
import ResetPasswordPage from "./pages/Auth/ResetPassword"
import ClientsListPage from "./pages/Clients/List"
import PlansPage from "./pages/Configurations/Plans/List"
import PlanDetailPage from "./pages/Configurations/Plans/Detail"
import ClientDetailPage from "./pages/Clients/Detail"
import TemplatesPage from "./pages/Configurations/Templates/List"
import TasksPage from "./pages/Tasks"
import PermissionsPage from "./pages/Configurations/Permissions"
import TemplateDetailPage from "./pages/Configurations/Templates/Detail"
import TrainingsPage from "./pages/Trainings"
import NewsletterReportUploadPage from "./pages/NewsletterReports/Upload"
import CreateClientPage from "./pages/Clients/Create"
import EditClientPage from "./pages/Clients/Edit"
import NewsletterReportListPage from "./pages/NewsletterReports/List"

const Router = () => {
    const { isLogged, getMe } = useAuth();

    useEffect(() => {
        getMe();
    }, []);

    return (
        <Routes>
            <Route path={APP_ROUTES.AUTH.SIGN_IN} element={isLogged ? <Navigate to='/dashboard' /> : <SignInPage />} />
            <Route path={APP_ROUTES.AUTH.FORGOT_PASSWORD} element={isLogged ? <Navigate to='/dashboard' /> : <ForgotPasswordPage />} />
            <Route path={APP_ROUTES.AUTH.FORGOT_PASSWORD_VERIFICATION_CODE} element={isLogged ? <Navigate to='/dashboard' /> : <VerificationCodePage />} />
            <Route path={APP_ROUTES.AUTH.CHANGE_PASSWORD} element={isLogged ? <Navigate to='/dashboard' /> : <ResetPasswordPage />} />
            <Route element={<MainLayout />}>
                <Route path={APP_ROUTES.HOME.INITIAL} element={<DashboardPage />} />
                <Route path={APP_ROUTES.CLIENTS.LIST} element={<ClientsListPage />} />
                <Route path={APP_ROUTES.CLIENTS.DETAIL} element={<ClientDetailPage />} />
                <Route path={APP_ROUTES.CLIENTS.CREATE} element={<CreateClientPage />} />
                <Route path={APP_ROUTES.CLIENTS.EDIT} element={<EditClientPage />} />

                <Route path={APP_ROUTES.CONFIGURATIONS.PLANS} element={<PlansPage />} />
                <Route path={APP_ROUTES.CONFIGURATIONS.PLAN_DETAIL} element={<PlanDetailPage />} />
                <Route path={APP_ROUTES.CONFIGURATIONS.TEMPLATES} element={<TemplatesPage />} />
                <Route path={APP_ROUTES.CONFIGURATIONS.TEMPLATE_DETAIL} element={<TemplateDetailPage />} />
                <Route path={APP_ROUTES.CONFIGURATIONS.PERMISSIONS} element={<PermissionsPage />} />
                <Route path={APP_ROUTES.TASKS.LIST} element={<TasksPage />} />
                <Route path={APP_ROUTES.TRAININGS.LIST} element={<TrainingsPage />} />
                <Route path={APP_ROUTES.NEWSLETTER_REPORTS.UPLOADS} element={<NewsletterReportUploadPage />} />
                <Route path={APP_ROUTES.NEWSLETTER_REPORTS.LIST} element={<NewsletterReportListPage />} />

                <Route path={APP_ROUTES.HOME.PROFILE} element={<ProfilePage />} />
            </Route>
        </Routes>
    )
}

export default Router