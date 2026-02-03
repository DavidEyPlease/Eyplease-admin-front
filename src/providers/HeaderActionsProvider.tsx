import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router';

interface HeaderActionsContextType {
    headerActions: ReactNode;
    setHeaderActions: (actions: ReactNode) => void;
}

const HeaderActionsContext = createContext<HeaderActionsContextType | undefined>(undefined);

export const HeaderActionsProvider = ({ children }: { children: ReactNode }) => {
    const [headerActions, setHeaderActions] = useState<ReactNode>(null);
    const location = useLocation();

    // Limpiar las acciones cuando cambia la ruta
    useEffect(() => {
        setHeaderActions(null);
    }, [location.pathname]);

    return (
        <HeaderActionsContext.Provider value={{ headerActions, setHeaderActions }}>
            {children}
        </HeaderActionsContext.Provider>
    );
};

export const useHeaderActions = () => {
    const context = useContext(HeaderActionsContext);
    if (context === undefined) {
        throw new Error('useHeaderActions debe usarse dentro de HeaderActionsProvider');
    }
    return context;
};
