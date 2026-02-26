import DropdownGroup from "@/components/common/Inputs/DropdownGroup";
import { API_ROUTES } from "@/constants/api";
import useRequestQuery from "@/hooks/useRequestQuery";
import useAuthStore from "@/store/auth";

const PostsPage = () => {
    const { utilData } = useAuthStore(state => state)
    const { request, requestState } = useRequestQuery()

    const newsletterGroups = utilData.newsletters.map(n => ({
        groupName: n.name,
        items: n.sections.filter(i => i.has_publish_posts).map(s => ({
            label: s.name,
            value: s.sectionKey
        }))
    }))

    const handleChange = async (sectionKey: string) => {
        console.log(sectionKey)

        await request('POST', API_ROUTES.POSTS.PUBLISH_NEWSLETTER, { section_key: sectionKey })
    }

    return (
        <div>
            <DropdownGroup
                label="Publicación de boletines"
                groups={newsletterGroups}
                placeholder="Seleccionar sección"
                value={''}
                onChange={handleChange}
            />
        </div>
    )
}

export default PostsPage;