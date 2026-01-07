import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Capabilities from './pages/Capabilities';
import Process from './pages/Process';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Portfolio": Portfolio,
    "Capabilities": Capabilities,
    "Process": Process,
    "About": About,
    "Contact": Contact,
    "Admin": Admin,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};