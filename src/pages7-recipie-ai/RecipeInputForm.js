import React, { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
const RecipeInputForm = ({ onFetchRecipe }) => {
  const [ingredients, setIngredients] = useState([]);
  const [cuisine, setCuisine] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [recipeCount, setRecipeCount] = useState(1);
  const [createdRecipes, setCreatedRecipes] = useState(0);
  const [remainingRecipes, setRemainingRecipes] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [guestCount, setguestCount] = useState(1);
  const [userCount, setUserCount] = useState(3);
  const [ingredientsCount, setIngredientsCount] = useState(10);

  const groceries = [
    "Prawn",
    "Gongura",
    "Spinach",
    "Palak Spinach",
    "Mint Leaves",
    "Chenna Dhal",
    "Urad Dhall",
    "Green Chillie",
    "Curd",
    "Tomato",
    "Onion",
    "Garlic",
    "Potato",
    "Carrot",
    "Cabbage",
    "Egg",
    "Chicken",
    "Beef",
    "Fish",
    "Rice",
    "Wheat Flour",
    "Milk",
    "Cheese",
    "Butter",
    "Salt",
    "Pepper",
    "Olive Oil",
    "Spinach",
    "Cucumber",
    "Corn",
    "Peas",
    "Sugar",
    "Lentils",
    "Beans",
    "Pasta",
    "Bread",
    "Chili Powder",
    "Ginger",
    "Yogurt",
    "Apple",
    "Banana",
    "Orange",
    "Strawberry",
    "Blueberry",
    "Pineapple",
    "Mango",
    "Papaya",
    "Avocado",
    "Zucchini",
    "Broccoli",
    "Cauliflower",
    "Celery",
    "Bell Pepper",
    "Sweet Potato",
    "Pumpkin",
    "Eggplant",
    "Mushroom",
    "Okra",
    "Beetroot",
    "Radish",
    "Leek",
    "Lettuce",
    "Kale",
    "Swiss Chard",
    "Bok Choy",
    "Parsley",
    "Cilantro",
    "Basil",
    "Mint",
    "Rosemary",
    "Thyme",
    "Oregano",
    "Sage",
    "Dill",
    "Tarragon",
    "Chives",
    "Fennel",
    "Lime",
    "Lemon",
    "Grapes",
    "Watermelon",
    "Cantaloupe",
    "Peach",
    "Plum",
    "Cherry",
    "Raspberry",
    "Blackberry",
    "Kiwi",
    "Guava",
    "Coconut",
    "Dragon Fruit",
    "Lychee",
    "Dates",
    "Figs",
    "Almonds",
    "Cashews",
    "Pistachios",
    "Walnuts",
    "Peanuts",
    "Hazelnuts",
    "Sunflower Seeds",
    "Pumpkin Seeds",
    "Chia Seeds",
    "Flax Seeds",
    "Sesame Seeds",
    "Coconut Milk",
    "Almond Milk",
    "Soy Milk",
    "Oat Milk",
    "Rice Milk",
    "Quinoa",
    "Barley",
    "Oats",
    "Couscous",
    "Polenta",
    "Semolina",
    "Tapioca",
    "Cornmeal",
    "Chickpea Flour",
    "Buckwheat",
    "Rye Flour",
    "Spelt Flour",
    "Whole Wheat Flour",
    "Bread Crumbs",
    "Panko",
    "Vanilla Extract",
    "Almond Extract",
    "Maple Syrup",
    "Honey",
    "Molasses",
    "Brown Sugar",
    "Powdered Sugar",
    "Cocoa Powder",
    "Baking Soda",
    "Baking Powder",
    "Cornstarch",
    "Gelatin",
    "Agar-Agar",
    "Yeast",
    "Butter Milk",
    "Cream Cheese",
    "Heavy Cream",
    "Sour Cream",
    "Cottage Cheese",
    "Paneer",
    "Tofu",
    "Tempeh",
    "Seitan",
    "Edamame",
    "Black Beans",
    "Kidney Beans",
    "White Beans",
    "Navy Beans",
    "Cannellini Beans",
    "Pinto Beans",
    "Lima Beans",
    "Fava Beans",
    "Soybeans",
    "Green Beans",
    "Chickpeas",
    "Hummus",
    "Tahini",
    "Peanut Butter",
    "Almond Butter",
    "Cashew Butter",
    "Jelly",
    "Jam",
    "Marmalade",
    "Pickles",
    "Relish",
    "Mayonnaise",
    "Ketchup",
    "Mustard",
    "Barbecue Sauce",
    "Hot Sauce",
    "Soy Sauce",
    "Fish Sauce",
    "Hoisin Sauce",
    "Oyster Sauce",
    "Worcestershire Sauce",
    "Vinegar",
    "Balsamic Vinegar",
    "Rice Vinegar",
    "Apple Cider Vinegar",
    "White Vinegar",
    "Miso",
    "Curry Paste",
    "Curry Powder",
    "Turmeric",
    "Coriander",
    "Cumin",
    "Cardamom",
    "Cloves",
    "Cinnamon",
    "Nutmeg",
    "Allspice",
    "Star Anise",
    "Black Pepper",
    "White Pepper",
    "Paprika",
    "Smoked Paprika",
    "Cayenne Pepper",
    "Red Chili Flakes",
    "Saffron",
    "Fenugreek",
    "Mustard Seeds",
    "Caraway",
    "Sumac",
    "Za'atar",
    "Garam Masala",
    "Herbes de Provence",
    "Italian Seasoning",
    "Bay Leaves",
    "Bouillon Cubes",
    "Chicken Stock",
    "Beef Stock",
    "Vegetable Stock",
    "Bone Broth",
    "Tomato Paste",
    "Tomato Sauce",
    "Crushed Tomatoes",
    "Diced Tomatoes",
    "Tomato Juice",
    "Kale Chips",
    "Seaweed Snacks",
    "Rice Crackers",
    "Popcorn",
    "Tortilla Chips",
    "Potato Chips",
    "Pretzels",
    "Granola Bars",
    "Trail Mix",
    "Dark Chocolate",
    "Milk Chocolate",
    "White Chocolate",
    "Ice Cream",
    "Sorbet",
    "Frozen Yogurt",
    "Frozen Berries",
    "Frozen Vegetables",
    "Frozen Pizza",
    "Frozen French Fries",
    "Frozen Meatballs",
    "Frozen Fish Fillets",
    "Shrimp",
    "Crab",
    "Lobster",
    "Clams",
    "Mussels",
    "Scallops",
    "Squid",
    "Octopus",
    "Salmon",
    "Tuna",
    "Cod",
    "Haddock",
    "Trout",
    "Mackerel",
    "Sardines",
    "Anchovies",
    "Duck",
    "Turkey",
    "Goose",
    "Venison",
    "Lamb",
    "Pork",
    "Ham",
    "Bacon",
    "Sausage",
    "Hot Dogs",
    "Meatballs",
    "Ground Beef",
    "Ground Turkey",
    "Ground Chicken",
    "Ground Pork",
    "Breakfast Cereal",
    "Oatmeal",
    "Granola",
    "Cornflakes",
    "Rice Krispies",
    "Muesli",
    "Pancake Mix",
    "Waffle Mix",
    "Biscuits",
    "Crackers",
    "Bagels",
    "English Muffins",
    "Croissants",
    "Pastries",
    "Muffins",
    "Cupcakes",
    "Brownies",
    "Cookies",
    "Cake Mix",
    "Pie Crust",
    "Pie Filling",
    "Canned Soup",
    "Instant Noodles",
    "Macaroni and Cheese",
    "Lasagna Sheets",
    "Ravioli",
    "Gnocchi",
    "Tortellini",
    "Spring Roll Wrappers",
    "Wonton Wrappers",
    "Rice Paper",
    "Nori Sheets",
    "Tofu Skin",
    "Hot Chocolate Mix",
    "Tea",
    "Green Tea",
    "Black Tea",
    "Herbal Tea",
    "Coffee",
    "Espresso",
    "Decaf Coffee",
    "Iced Coffee",
    "Coffee Creamer",
    "Soft Drinks",
    "Juice",
    "Smoothies",
    "Energy Drinks",
    "Sports Drinks",
    "Sparkling Water",
    "Mineral Water",
    "Beer",
    "Wine",
    "Whiskey",
    "Vodka",
    "Rum",
    "Tequila",
    "Gin",
    "Liqueur",
    "Cocktail Mixers",
    "Champagne",
    "Cider",
    "Sake",
    "Mead",
  ];
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    setIsGuest(!loggedInUser); // If no user is logged in, it's a guest

    const today = new Date().toISOString().split("T")[0]; // Current date
    const recipeData = JSON.parse(secureLocalStorage.getItem("recipeData")) || {};

    // Check if data exists for today
    if (recipeData[today]) {
      const userRecipes = recipeData[today][loggedInUser?.email || "guest"] || 0;
      setCreatedRecipes(userRecipes);
      setRemainingRecipes(isGuest ? Math.max(0, guestCount - userRecipes) : Math.max(0, userCount - userRecipes));
    } else {
      setRemainingRecipes(isGuest ? guestCount : userCount);
    }
  }, [isGuest]);
  const handleAddIngredient = (ingredient) => {
    if (ingredient && !ingredients.includes(ingredient)) {
      if (ingredients.length < ingredientsCount) {
        setIngredients((prev) => [...prev, ingredient]);
      } else {
        alert("You can add a maximum of 10 ingredients.");
      }
    }
    setInputValue("");
  };

  const handleRemoveIngredient = (ingredientToRemove) => {
    setIngredients((prev) => prev.filter((ingredient) => ingredient !== ingredientToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ingredients.length > 0 && cuisine) {
      const prompt = `Suggest ${recipeCount} good ${cuisine} recipe using the following ingredients, and share the Calorie, Ingredients and Steps. Quote Recipe name with in "~". Main Ingredients are: ${ingredients.join(", ")}. Just share the Token Count in the last?`;

      onFetchRecipe(ingredients.join(", "), cuisine, prompt);

      // Update the count in localStorage
      const today = new Date().toISOString().split("T")[0];
      const recipeData = JSON.parse(secureLocalStorage.getItem("recipeData")) || {};

      if (!recipeData[today]) {
        recipeData[today] = {};
      }

      const email = JSON.parse(localStorage.getItem("loggedInUser"))?.email || "guest";
      recipeData[today][email] = (recipeData[today][email] || 0) + 1;

      secureLocalStorage.setItem("recipeData", JSON.stringify(recipeData));
      setIngredients([]);
      // Update the state
      setCreatedRecipes((prev) => prev + 1);
      setRemainingRecipes((prev) => prev - 1);
    } else {
      alert("Please enter ingredients and select a cuisine.");
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const filteredGroceries = groceries.filter((grocery) => grocery.toLowerCase().includes(inputValue.toLowerCase()));

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-2">
        <label>Available Ingredients:</label>
        <div
          style={{
            border: "0px solid #ccc",
            borderRadius: "5px",
            padding: "0px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: "#e0e0e0",
                  borderRadius: "3px",
                  padding: "1px 1px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <small className="text-nowrap">
                  <button
                    className="p-1"
                    style={{
                      marginLeft: "1px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRemoveIngredient(ingredient)}
                  >
                    {ingredient} ✖
                  </button>
                </small>
              </span>
            ))}
          </div>
          <input
            type="text"
            className="form-control"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search or add ingredients"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddIngredient(inputValue);
              }
            }}
          />
          {inputValue && filteredGroceries.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                padding: "0",
                margin: "5px 0 0",
                border: "1px solid #ccc",
                borderRadius: "5px",
                backgroundColor: "#fff",
                position: "absolute",
                width: "100%",
                maxHeight: "150px",
                overflowY: "auto",
                zIndex: 1000,
              }}
            >
              {filteredGroceries.map((item, index) => (
                <li
                  key={index}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={() => handleAddIngredient(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-2">
        <label>Select Cuisine:</label>
        <select value={cuisine} className="form-control" onChange={(e) => setCuisine(e.target.value)}>
          <option value="">-- Select Cuisine --</option>
          <option value="Italian">Italian</option>
          <option value="Indian">Indian</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="American">American</option>
          <option value="French">French</option>
          <option value="Mexican">Mexican</option>
          <option value="Spanish">Spanish</option>
          <option value="Thai">Thai</option>
          <option value="Greek">Greek</option>
        </select>
      </div>
      <div className="mt-4">
        <button type="submit" className="bg-myapp-recipe-ai-warning" disabled={remainingRecipes === 0}>
          Create New Recipe {remainingRecipes === 0 ? "Tomorrow" : ""}
        </button>
        <small> Remaining Recipes: {remainingRecipes}</small>
      </div>
    </form>
  );
};

export default RecipeInputForm;
