import Capabilities from './pages/Capabilities';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Process from './pages/Process';
import Contact from './pages/Contact';
import About from './pages/About';
import Admin from './pages/Admin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Capabilities": Capabilities,
    "Home": Home,
    "Portfolio": Portfolio,
    "Process": Process,
    "Contact": Contact,
    "About": About,
    "Admin": Admin,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};