// frontend-template/vite/src/menu-items/index.js
import dashboard from './dashboard';
import pages from './pages';
import utilities from './utilities';
import other from './other';
import saisie from './saisie';
import formation from './formation';
import entreprise from './entreprise';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, pages, utilities, other, saisie, formation,entreprise]
};

export default menuItems;
