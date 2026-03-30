// frontend-template/vite/src/menu-items/entreprise.js
// assets
import { IconBuildingStore } from "@tabler/icons-react"; // building icon for entreprise

const entreprise = {
  id: "entreprise",
  title: "Fournisseurs",
  type: "group",
  children: [
    {
      id: "entreprises",
      title: "Fournisseurs",
      type: "item",
      url: "/fournisseurs",
      icon: IconBuildingStore,
      breadcrumbs: false
    }
  ]
};

export default entreprise;
