import { useState } from "react";
import { IClient } from "@/interfaces/clients";
import ClientForm from "../components/Form";

const CreateClientPage = () => {
    const [client, setClient] = useState<IClient>();

    return (
        <ClientForm client={client} onSetClient={setClient} />
    )
}

export default CreateClientPage;