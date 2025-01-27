// src/data/apps.js
import expenseTracker from "../images/pr_source.png";
import splitEqual from "../images/splitequal.png";
import todoList from "../images/todolist.jpg";
import qrGenerator from "../images/qr.jpg";
import bmiTracker from "../images/bmi.jpg";
import money from "../images/money.jpg";
import recipeai from "../images/recipeailogo.jpg";
import commingsoon from "../images/commingsoon.jpg";
import config from "../config.json";
const apps = [
  {
    name: "Recipe AI",
    shortname: "RecipeAI",
    href: "/",
    image: recipeai,
    favotire: false,
    display: true,
    category: "AI",
  },
  {
    name: "More",
    shortname: "More",
    href: "#",
    image: commingsoon,
    favotire: false,
    display: false,
    category: "moreAI",
  },
];

const getFilteredApps = () => {
  const currentUrl = window.location.hostname; // Get the current hostname

  if (currentUrl.includes("aiapps.eshope.com") || currentUrl.includes("testapps.eshope.com") || currentUrl.includes(config.localhost)) {
    return apps.filter((app) => app.category.includes("AI"));
  } else {
    return apps.filter((app) => app.category !== "AI");
  }
};

export default getFilteredApps();
