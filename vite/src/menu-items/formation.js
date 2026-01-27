// frontend-template/vite/src/menu-items/formation.js
// assets
import { IconBook } from "@tabler/icons-react";

const formation = {
  id: "formation",
  title: "Formations",
  type: "group",
  children: [
    {
      id: "formations",
      title: "Formations",
      type: "item",
      url: "/formations",
      icon: IconBook,
      breadcrumbs: false
    }
  ]
};

export default formation;