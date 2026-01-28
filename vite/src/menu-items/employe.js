// frontend-template/vite/src/menu-items/employe.js
// assets
import { IconUsers } from "@tabler/icons-react";

const employe = {
  id: "employe",
  title: "Employés",
  type: "group",
  children: [
    {
      id: "employes",
      title: "Employés",
      type: "item",
      url: "/employes",
      icon: IconUsers,
      breadcrumbs: false
    }
  ]
};

export default employe;
