import About from './pages/About';
import Admin from './pages/Admin';
import Capabilities from './pages/Capabilities';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Process from './pages/Process';
import SitemapXml from './pages/SitemapXml';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Admin": Admin,
    "Capabilities": Capabilities,
    "Contact": Contact,
    "Home": Home,
    "Portfolio": Portfolio,
    "Process": Process,
    "SitemapXml": SitemapXml,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};