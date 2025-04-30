import axios from "axios";
import uuid from "react-uuid";
import config from "../config.json";
import AWS from "aws-sdk";

// Save new expense to the server
export const saveUser = async (user) => {
  try {
    user.id = uuid();
    user.type = "appusers";
    console.log(user);
    await fetch(process.env.REACT_APP_SERVICE_URL + "/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    console.log("user saved");
  } catch (err) {
    console.log("Error saving expense: ", err);
    throw err;
  } finally {
    return 200;
  }
};

export const sendEmail = async (data) => {
  console.log("from service call start", data);

  try {
    const response = await fetch(process.env.REACT_APP_EAMIL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // Check if response is okay
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json(); // Parse JSON response
    console.log("Email sent successfully", result);
    return result;
  } catch (err) {
    console.error("Error sending email", err);
    return { error: err.message || "Unknown error occurred" };
  }
};

// Save new expense to the server
export const UpdateUser = async (user) => {
  try {
    user.id = user.id;
    user.type = "appusers";
    console.log(user);
    await fetch(process.env.REACT_APP_SERVICE_URL + "/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    console.log("user updaed");
  } catch (err) {
    console.log("Error saving user: ", err);
    throw err;
  } finally {
    return 200;
  }
};
export const UpdateData = async (user) => {
  try {
    console.log(user);
    await fetch(process.env.REACT_APP_SERVICE_URL + "/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    console.log("user updaed");
  } catch (err) {
    console.log("Error saving user: ", err);
    throw err;
  } finally {
    return 200;
  }
};
export const addData = async (data) => {
  try {
    console.log(data);
    await fetch(process.env.REACT_APP_SERVICE_URL + "/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("Item saved");
  } catch (err) {
    console.log("Error saving category: ", err);
    throw err;
  } finally {
    return 200;
  }
};

export const onAddFriendService = async (user) => {
  try {
    user.id = uuid();
    user.type = "usersfriend";
    console.log(user);
    await fetch(process.env.REACT_APP_SERVICE_URL + "/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    console.log("user and balance saved");
  } catch (err) {
    console.log("Error saving expense: ", err);
    throw err;
  } finally {
    return 200;
  }
};
export const addExpenseCategory = async (data) => {
  try {
    console.log(data);
    await fetch(process.env.REACT_APP_SERVICE_URL + "/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("category saved");
  } catch (err) {
    console.log("Error saving category: ", err);
    throw err;
  } finally {
    return 200;
  }
};
export const getExpenseCategory = async (email) => {
  try {
    console.log("Fetching data for email:", email);

    // Prepare the request body
    const requestBody = {
      column1: "email",
      value1: email,
      column2: "type",
      value2: "expense-category",
    };

    // Make a POST request to the Lambda endpoint
    const response = await fetch(process.env.REACT_APP_SERVICE_URL + "items/filter2column", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Parse and return the filtered data
    const data = await response.json();
    return data || []; // Return items or an empty array if no items found
  } catch (err) {
    console.log("Error getting users:", err);
    return []; // Return an empty array on error
  }
};

export const onUpdateFriendService = async (user) => {
  try {
    user.type = "usersfriend";
    console.log("onUpdateFriendService", user);
    await fetch(process.env.REACT_APP_SERVICE_URL + "/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    console.log("user and balance updated");
  } catch (err) {
    console.log("Error saving expense: ", err);
    throw err;
  } finally {
    return 200;
  }
};
export const getDataFromServer = async (email) => {
  try {
    console.log("Fetching data for email:", email);

    // Prepare the request body
    const requestBody = {
      column1: "email",
      value1: email,
      column2: "type",
      value2: "usersfriend",
    };

    // Make a POST request to the Lambda endpoint
    const response = await fetch(process.env.REACT_APP_SERVICE_URL + "items/filter2column", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Parse and return the filtered data
    const data = await response.json();
    return data || []; // Return items or an empty array if no items found
  } catch (err) {
    console.log("Error getting users:", err);
    return []; // Return an empty array on error
  }
};
// personal expense
export const getPersonalExpense = async (email) => {
  try {
    console.log("Fetching personal expense data for email:", email);

    // Prepare the request body
    const requestBody = {
      column1: "email",
      value1: email,
      column2: "type",
      value2: "expense",
    };

    // Make a POST request to the Lambda endpoint
    const response = await fetch(process.env.REACT_APP_SERVICE_URL + "items/filter2column", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    const filteredData = data.filter((item) => item.expensetype === "personal");
    console.log("shared data", filteredData);
    return filteredData || [];
  } catch (err) {
    console.log("Error getting users:", err);
    return [];
  }
};
export const getSharedExpense = async (email) => {
  try {
    console.log("Fetching expense data shared it has shared email:", email);

    const requestBody = {
      column1: "sharedWith",
      value1: email,
      column2: "type",
      value2: "expense",
    };

    const response = await fetch(process.env.REACT_APP_SERVICE_URL + "items/filter2column", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    const filteredData = data.filter((item) => item.expensetype === "shared");
    console.log("shared data", filteredData);
    return filteredData || [];
  } catch (err) {
    console.log("Error getting users:", err);
    return [];
  }
};
export const getExpenseHistory = async (email) => {
  try {
    console.log("Fetching expense data for email:", email);

    // Prepare the request body
    const requestBody = {
      column1: "email",
      value1: email,
      column2: "type",
      value2: "expense",
    };

    // Make a POST request to the Lambda endpoint
    const response = await fetch(process.env.REACT_APP_SERVICE_URL + "items/filter2column", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    return data || [];
  } catch (err) {
    console.log("Error getting users:", err);
    return [];
  }
};
export const fetchUsers_old = async (email) => {
  try {
    console.log(email);
    const response = await fetch(process.env.REACT_APP_SERVICE_URL + "itemsbytype/appusers");
    ///items/{column}/{value}
    const data = await response.json();
    // Filter the user by email
    const user = data.find((user) => user.email === email);
    // Return the matched user or null if not found
    return user || null;
  } catch (err) {
    console.log("Error getting users: ", err);
    throw err; // Re-throw the error to handle it outside
  }
};

export const fetchUsers = async (email) => {
  try {
    console.log("Fetching user for email:", email);
    // Prepare the request body with filtering conditions
    const requestBody = {
      column1: "email",
      value1: email,
      column2: "type",
      value2: "appusers",
    };

    // Make a POST request to the Lambda endpoint
    const response = await fetch(process.env.REACT_APP_SERVICE_URL + "items/filter2column", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    // Parse the JSON response
    const data = await response.json();
    return data[0];
  } catch (err) {
    console.log("Error getting users:", err);
    throw err; // Re-throw the error for handling outside
  }
};
export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SERVICE_URL}/removeitem/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete user.");
    }
    console.log("User deleted successfully:", id);
    return; // Return the response data if needed
  } catch (err) {
    console.log("Error deleting user:", err);
    throw err; // Re-throw the error to handle it in the calling function
  }
};
export const getData = async (email, type) => {
  try {
    console.log("Fetching personal expense data for email:", email);

    // Prepare the request body
    const requestBody = {
      column1: "email",
      value1: email,
      column2: "type",
      value2: type,
    };

    // Make a POST request to the Lambda endpoint
    const response = await fetch(process.env.REACT_APP_SERVICE_URL + "items/filter2column", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log(" data", data);
    return data || [];
  } catch (err) {
    console.log("Error getting users:", err);
    return [];
  }
};
export const getData_Any2Column = async (column1, value1, column2, value2) => {
  try {
    console.log("Fetching personal expense data for email:", value1);

    // Prepare the request body
    const requestBody = {
      column1: column1,
      value1: value1,
      column2: column2,
      value2: value2,
    };

    // Make a POST request to the Lambda endpoint
    const response = await fetch(process.env.REACT_APP_SERVICE_URL + "items/filter2column", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log(" data", data);
    return data || [];
  } catch (err) {
    console.log("Error getting users:", err);
    return [];
  }
};
export const getItemsbyid = async (id) => {
  try {
    console.log("Fetching items by ID:", id);
    const url = `${process.env.REACT_APP_SERVICE_URL}/items/id/${id}`; // Ensure proper URL construction
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Fetched data:", data);
    return data || [];
  } catch (err) {
    console.error("Error fetching items by ID:", err);
    return [];
  }
};
export const deleteData = async (id) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SERVICE_URL}/removeitem/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete user.");
    }
    console.log("data deleted successfully:", id);
    return; // Return the response data if needed
  } catch (err) {
    console.log("Error deleting user:", err);
    throw err; // Re-throw the error to handle it in the calling function
  }
};

export const getCurrency = (country) => {
  const countryCurrencyData = getCountryCurrency();
  const matched = countryCurrencyData.find((item) => item.country.toLowerCase() === country.toLowerCase());
  return matched ? matched.currency : "";
};
export const getCountryCurrency = () => {
  return [
    { country: "United States", currency: "$", currencyName: "Dollar", code: "USD" },
    { country: "India", currency: "₹", currencyName: "Rupees", code: "INR" },
    { country: "Canada", currency: "CA$", currencyName: "Canadian Dollar", code: "CAD" },
    { country: "Australia", currency: "A$", currencyName: "Australian Dollar", code: "AUD" },
    { country: "Uruguay", currency: "$U", currencyName: "Uruguayan Peso", code: "UYU" },
    { country: "United Kingdom", currency: "£", currencyName: "Pound Sterling", code: "GBP" },
    { country: "Ireland", currency: "€", currencyName: "Euro", code: "EUR" },
    { country: "Mexico", currency: "$", currencyName: "Mexican Peso", code: "MXN" },
    { country: "Brazil", currency: "R$", currencyName: "Brazilian Real", code: "BRL" },
  ];
};
export const getCurrencyName = (currency) => {
  const countryCurrencyData = getCountryCurrency();
  const matched = countryCurrencyData.find((item) => item.currency === currency);
  return matched ? matched.currencyName : "Unknown";
};
export const getItemsbyType = async (type) => {
  try {
    console.log(type);
    const response = await fetch(process.env.REACT_APP_SERVICE_URL + "itemsbytype/" + type);
    const data = await response.json();
    return data || null;
  } catch (err) {
    console.log("Error getting users: ", err);
    throw err;
  }
};
export const fetchRecipe = async (ingredients, cuisine) => {
  try {
    const response = await fetch(process.env.REACT_APP_AI_SERVICE_URL + "recepie-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ingredients: ingredients,
        cuisine: cuisine,
      }),
    });

    if (!response) {
      throw new Error("Failed to fetch recipe data");
    }

    const data = await response.json();
    return data.recipe;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    throw error;
  }
};
export const generateImage_usingBedrock = async (prompt) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_AI_SERVICE_URL}ai-image-generation-aws-bedrock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        quality: "standard",
        cfgScale: 10.0,
        height: 512,
        width: 512,
        numberOfImages: 1,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate image");
    }

    const data = await response.json();
    console.log("url generating image:", data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const uploadFileToS3 = async (imagename, file) => {
  imagename = process.env.REACT_APP_ENV + "-" + imagename;
  return new Promise((resolve, reject) => {
    const S3_BUCKET = process.env.REACT_APP_S3_BUCKET_NAME;
    const REGION = process.env.REACT_APP_S3_REGION;

    AWS.config.update({
      accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY.replace("RAMUK89", ""),
      secretAccessKey: process.env.REACT_APP_S3_SECRET_KEY.replace("ramuk89", ""),
    });

    const s3 = new AWS.S3({
      params: { Bucket: S3_BUCKET },
      region: REGION,
    });

    const params = {
      Bucket: S3_BUCKET,
      Key: imagename,
      Body: file,
      ACL: "public-read", // Make file publicly readable
    };

    s3.putObject(params)
      .promise()
      .then(() => {
        const url = `${process.env.REACT_APP_S3_BUCKET_URL}/${imagename}`;
        resolve(url);
      })
      .catch((err) => {
        console.error("Error uploading to S3:", err);
        reject(err);
      });
  });
};

export const imagetoCaption = async (imageUrl) => {
  try {
    const response = await fetch(process.env.REACT_APP_AI_SERVICE_URL + "image-to-bill-split", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Assuming the response contains a "caption" field
  } catch (error) {
    console.error("Error fetching caption:", error.message);
    throw error;
  }
};

export const formatRecipe = (text) => {
  const lines = text && text.split("\n");
  return (
    lines &&
    lines.map((line, index) => {
      // Bold the recipe name by replacing ~name~ with <strong>name</strong>
      let formattedLine = line.replace(/~(.*?)~/g, (match, p1) => `<h5><strong>${p1.replace(/"/g, "").trim()}</strong></h5>`);

      // Bold text within ** by replacing **text** with <strong>text</strong>
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong>${p1}</strong>`);

      if (line.startsWith("* ")) {
        // List items
        return (
          <small>
            <li className="text-small" key={index} dangerouslySetInnerHTML={{ __html: formattedLine.slice(2) }} />
          </small>
        );
      } else if (/^\d+\.\s/.test(line)) {
        // Numbered list items
        return <p key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
      } else {
        // Regular text or headings
        return <p key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
      }
    })
  );
};

export const maskEmail = (email) => {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2) {
    return `${name[0]}*****@${domain}`;
  }
  const first = name[0];
  const last = name[name.length - 1]; // Make last uppercase, as requested
  const masked = "*".repeat(name.length - 2);
  return `${first}${masked}${last}@${domain}`;
};

export const calculateAmountOwedToMember_ = (expenses, loggedInUser, memberEmail) => {
  let rawAmountOwed = 0;
  let totalSettledAmount = 0;

  expenses.forEach((expense) => {
    if (expense.splitType !== "settleup-group") {
      if (expense.isdeleted === 1) return;
      const paidBy = expense.paidBy;
      const userShare = expense.shares?.[loggedInUser?.email] || 0;
      const memberShare = expense.shares?.[memberEmail] || 0;

      if (paidBy === memberEmail && userShare > 0) {
        rawAmountOwed += parseFloat(userShare);
      } else if (paidBy === loggedInUser?.email && memberShare > 0) {
        rawAmountOwed -= parseFloat(memberShare);
      }
    } else {
      const settlement = expense.settlementData;
      const isBetween = (settlement?.payerEmail === loggedInUser?.email && settlement?.recipientEmail === memberEmail) || (settlement?.payerEmail === memberEmail && settlement?.recipientEmail === loggedInUser?.email);
      if (isBetween) {
        totalSettledAmount += Math.abs(parseFloat(expense.amount || 0));
      }
    }
  });

  const finalAmount = Math.abs(rawAmountOwed) - totalSettledAmount;
  return rawAmountOwed >= 0 ? finalAmount : -finalAmount;
};
