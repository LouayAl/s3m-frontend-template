import { IconUserCog } from "@tabler/icons-react";

const formateur = {
  id: "formateur",
  title: "Formateurs",
  type: "group",
  children: [
    {
      id: "formateurs",
      title: "Formateurs",
      type: "item",
      url: "/formateurs",
      icon: IconUserCog,
      breadcrumbs: false,
    },
  ],
};

export default formateur;