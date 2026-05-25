import { IconGallery } from '@/components/Svg/IconGallery'
import { IconTools } from '@/components/Svg/IconTools'
import { IconTraining } from '@/components/Svg/IconTraining'
import { IconReports } from '@/components/Svg/IconReports'
import { IconHome } from '@/components/Svg/IconHome'
import { IconServices } from '@/components/Svg/IconServices'
import { IconPosts } from '@/components/Svg/IconPosts'
import { IconSetting } from '@/components/Svg/IconSetting'
import { ProjectorIcon } from 'lucide-react'

export const ICONS: { [key: string]: React.FC } = {
    'home': IconHome,
    'gallery': IconGallery,
    'settings': IconSetting,
    'tasks': IconTools,
    'services': IconServices,
    'trainings': IconTraining,
    'reportUploads': IconReports,
    'posts': IconPosts,
    'templates': ProjectorIcon
}
