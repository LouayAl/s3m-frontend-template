// frontend-template/vite/src/menu-items/index.js
import dashboard from './dashboard';
import pages from './pages';
import utilities from './utilities';
import other from './other';
import session from './session';
import formation from './formation';
import entreprise from './entreprise';
import employe from './employe';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, session, formation, entreprise, employe]
};

export default menuItems;
