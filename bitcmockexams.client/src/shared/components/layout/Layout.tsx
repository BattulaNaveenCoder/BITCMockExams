import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppFab from './WhatsAppFab';

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="app-layout">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <WhatsAppFab />
            <Footer />
        </div>
    );
};

export default Layout;
