import React, { createContext, useContext, useState, ReactNode } from 'react';

type TransitionState = 'hero' | 'transitioning' | 'projects';

interface TransitionContextType {
    transitionState: TransitionState;
    startTransition: () => void;
    completeTransition: () => void;
    resetTransition: () => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
    const [transitionState, setTransitionState] = useState<TransitionState>('hero');

    const startTransition = () => {
        setTransitionState('transitioning');
    };

    const completeTransition = () => {
        setTransitionState('projects');
    };

    const resetTransition = () => {
        setTransitionState('hero');
    };

    return (
        <TransitionContext.Provider value={{ transitionState, startTransition, completeTransition, resetTransition }}>
            {children}
        </TransitionContext.Provider>
    );
};

export const useTransition = () => {
    const context = useContext(TransitionContext);
    if (context === undefined) {
        throw new Error('useTransition must be used within a TransitionProvider');
    }
    return context;
};
