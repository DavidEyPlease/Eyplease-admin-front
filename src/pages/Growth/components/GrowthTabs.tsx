import { NavLink } from 'react-router'

import { APP_ROUTES } from '@/constants/app'
import { cn } from '@/lib/utils'

/** Embudo · Prospectos: las dos caras del mismo trabajo, a un clic una de la otra. */
const GrowthTabs = () => (
    <nav className="gro-tabs shell-glass">
        {[
            { to: APP_ROUTES.GROWTH.FUNNEL, label: 'Embudo' },
            { to: APP_ROUTES.GROWTH.PROSPECTS, label: 'Prospectos' },
        ].map(tab => (
            <NavLink key={tab.to} to={tab.to} end className={({ isActive }) => cn(isActive && 'on')}>{tab.label}</NavLink>
        ))}
    </nav>
)

export default GrowthTabs
