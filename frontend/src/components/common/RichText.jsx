import React from 'react';
import { NavLink } from 'react-router-dom';

const RichText = ({ text, style }) => {
    if (!text) return null;

    // Pattern for hashtags and mentions
    const pattern = /([#@][\w\d_]+)/g;
    const parts = text.split(pattern);

    return (
        <span style={style}>
            {parts.map((part, i) => {
                if (part.startsWith('#')) {
                    const tag = part.substring(1);
                    return (
                        <NavLink
                            key={i}
                            to={`/explore?q=%23${tag}`}
                            style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'var(--font-semibold)' }}
                            onClick={(e) => e.stopPropagation()} // Prevent double-triggering parent clicks
                        >
                            {part}
                        </NavLink>
                    );
                }
                if (part.startsWith('@')) {
                    // Note: This assumes usernames are unique and can be navigated to via a specific route
                    // We might need a userId mapping if we use UIDs in production
                    const username = part.substring(1);
                    return (
                        <NavLink
                            key={i}
                            to={`/explore?q=${username}`}
                            style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'var(--font-semibold)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </NavLink>
                    );
                }
                return part;
            })}
        </span>
    );
};

export default RichText;
