// D:\stylescapes\frontend\src\components\layout\Layout.js

import React from 'react';
import Header from './Header';
import Footer from './Footer';

// Accept user and setUser as props
const Layout = ({ children, user, setUser }) => {
    // NOTE: cartItemCount was typically calculated in App.js or hardcoded here
    const cartItemCount = 0; 
    
    return (
        <div>
            {/* Pass props to Header */}
            <Header user={user} setUser={setUser} cartItemCount={cartItemCount} />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;