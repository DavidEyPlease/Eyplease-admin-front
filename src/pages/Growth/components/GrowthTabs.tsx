import { NavLink } from 'react-router'

import { APP_ROUTES } from '@/constants/app'
import { cn } from '@/lib/utils'

/** Embudo · Prospectos · Redes · Web: las caras del mismo trabajo, a un clic una de la otra. */
const GrowthTabs = () => (
    <nav className="gro-tabs shell-glass">
        {[
            { to: APP_ROUTES.GROWTH.FUNNEL, label: 'Embudo' },
            { to: APP_ROUTES.GROWTH.PROSPECTS, label: 'Prospectos' },
            { to: APP_ROUTES.GROWTH.SOCIAL, label: 'Redes' },
            { to: APP_ROUTES.GROWTH.WEB, label: 'Web' },
        ].map(tab => (
            <NavLink key={tab.to} to={tab.to} end className={({ isActive }) => cn(isActive && 'on')}>{tab.label}</NavLink>
        ))}
    </nav>
)

export default GrowthTabs
