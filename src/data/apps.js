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
    name: "Expense Tracker",
    shortname: "Expense",
    href: "/app1/home",
    image: expenseTracker,
    favotire: false,
    display: true,
    category: "Finance",
    loginpage: true,
  },
  {
    name: "Split Equal",
    shortname: "Split",
    href: "/app2/home",
    image: splitEqual,
    favotire: false,
    display: true,
    category: "Finance",
    loginpage: true,
  },
  {
    name: "To Do List",
    shortname: "ToDo",
    href: "/app4/home",
    image: todoList,
    favotire: false,
    display: true,
    category: "Finance",
    loginpage: true,
  },
  {
    name: "QR Generator",
    shortname: "QR",
    href: "/app3/createqr",
    image: qrGenerator,
    favotire: false,
    display: false,
    category: "Utility",
    loginpage: false,
  },
  {
    name: "Weight/BMI Tracker",
    shortname: "BMI",
    href: "/app5/home",
    image: bmiTracker,
    favotire: false,
    display: true,
    category: "Health",
    loginpage: true,
  },
  {
    name: "Financial Calculator",
    shortname: "Finance",
    href: "/app6/sip",
    image: money,
    favotire: false,
    display: true,
    category: "Finance",
    loginpage: true,
  },
  {
    name: "Recipe AI",
    shortname: "RecipeAI",
    href: "/app7/home",
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
