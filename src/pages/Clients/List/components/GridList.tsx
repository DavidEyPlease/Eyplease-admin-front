import FadeInGrid from "@/components/generics/FadeInGrid"
import { ClientCard } from "./ClientCard"
import { IClientListItem } from "@/interfaces/clients"

interface IClientsGridListProps {
    items: IClientListItem[]
}

const ClientsGridList = ({ items }: IClientsGridListProps) => {
    return (
        <FadeInGrid gridClassName="md:grid-cols-2 lg:grid-cols-3">
            {
                items.map(item => (
                    <ClientCard key={item.id} client={item} />
                ))
            }
        </FadeInGrid>
    )
}

export default ClientsGridList