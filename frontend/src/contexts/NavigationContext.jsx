import React, { createContext, useContext, useReducer, useCallback } from 'react';

const NavigationContext = createContext();

const initialState = {
    currentPost: null,
    feedContext: [],
    activeFeedType: 'home', // 'home', 'explore', 'profile'
    isViewerOpen: false,
};

function navigationReducer(state, action) {
    switch (action.type) {
        case 'OPEN_VIEWER':
            return {
                ...state,
                currentPost: action.payload.post,
                feedContext: action.payload.feedContext || state.feedContext,
                activeFeedType: action.payload.feedType || state.activeFeedType,
                isViewerOpen: true
            };
        case 'CLOSE_VIEWER':
            return {
                ...state,
                currentPost: null,
                isViewerOpen: false
            };
        case 'NAVIGATE_TO_POST':
            return {
                ...state,
                currentPost: action.payload
            };
        case 'SET_FEED_CONTEXT':
            return {
                ...state,
                feedContext: action.payload.posts,
                activeFeedType: action.payload.feedType || state.activeFeedType
            };
        default:
            return state;
    }
}

export const NavigationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(navigationReducer, initialState);

    const openPostViewer = useCallback((post, feedType, feedContext) => {
        dispatch({ type: 'OPEN_VIEWER', payload: { post, feedType, feedContext } });
    }, []);

    const setFeedContext = useCallback((posts, feedType) => {
        dispatch({ type: 'SET_FEED_CONTEXT', payload: { posts, feedType } });
    }, []);

    const closePostViewer = useCallback(() => {
        dispatch({ type: 'CLOSE_VIEWER' });
    }, []);

    const navigateToNextPost = useCallback(() => {
        if (!state.currentPost || !state.feedContext.length) return;
        const currentIndex = state.feedContext.findIndex(p => p._id === state.currentPost._id);
        if (currentIndex !== -1 && currentIndex < state.feedContext.length - 1) {
            dispatch({ type: 'NAVIGATE_TO_POST', payload: state.feedContext[currentIndex + 1] });
        }
    }, [state.currentPost, state.feedContext]);

    const navigateToPreviousPost = useCallback(() => {
        if (!state.currentPost || !state.feedContext.length) return;
        const currentIndex = state.feedContext.findIndex(p => p._id === state.currentPost._id);
        if (currentIndex > 0) {
            dispatch({ type: 'NAVIGATE_TO_POST', payload: state.feedContext[currentIndex - 1] });
        }
    }, [state.currentPost, state.feedContext]);

    const value = {
        ...state,
        openPostViewer,
        setFeedContext,
        closePostViewer,
        navigateToNextPost,
        navigateToPreviousPost
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useGNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useGNavigation must be used within a NavigationProvider');
    }
    return context;
};
