import About from './pages/About';
import Capabilities from './pages/Capabilities';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Process from './pages/Process';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Capabilities": Capabilities,
    "Home": Home,
    "Portfolio": Portfolio,
    "Process": Process,
    "Admin": Admin,
    "Contact": Contact,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};