// frontend-template/vite/src/menu-items/entreprise.js
// assets
import { IconBuildingStore } from "@tabler/icons-react"; // building icon for entreprise

const entreprise = {
  id: "entreprise",
  title: "Entreprises",
  type: "group",
  children: [
    {
      id: "entreprises",
      title: "Entreprises",
      type: "item",
      url: "/entreprises",
      icon: IconBuildingStore,
      breadcrumbs: false
    }
  ]
};

export default entreprise;
