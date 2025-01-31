import React, { useState, useEffect } from "react";
import { uploadFileToS3, imagetoCaption, imagetoCaptionUsingOpenAI, addData, formatRecipe } from "../service/APIService";
import { v4 as uuid } from "uuid";
import CalorieHistoryComponent from "./CalorieHistoryComponent";
import NutritionComponent from "./NutritionComponent";
import secureLocalStorage from "react-secure-storage";
import Loading from "./Loading";
import img5 from "../images/pot.gif";
import logo from "../images/recipeailogo.jpg";
import config from "../config.json";
import Resizer from "react-image-file-resizer";
const ImageUpload = () => {
  const [file, setFile] = useState([]); // Stores the uploaded file
  const [imageUrl, setImageUrl] = useState(""); // Stores the S3 URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [caption, setCaption] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [nutritionInfo, setNutritionInfo] = useState({ title: "", calories: "", carbs: "", protein: "", fat: "" });
  const [remainingUploads, setRemainingUploads] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [guestCount, setguestCount] = useState(config.guestCount);
  const [userCount, setUserCount] = useState(config.userCount);

  const loggedInUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
  const userKey = loggedInUser?.email || "guest";

  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isAndroidWebView = /Android.*(wv|Version\/[\d.]+).*Chrome/.test(userAgent);

  console.log(isAndroidWebView ? "Running in Android WebView" : "Not in WebView");
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const recipeData = JSON.parse(secureLocalStorage.getItem("UploadrecipeData")) || {};
    // Check if logged in or guest
    setIsGuest(!loggedInUser);
    // Check uploads for today
    const userKey = loggedInUser?.email || "guest";
    const dailyUploads = recipeData[today]?.[userKey] || 0;

    // Set remaining uploads based on user type
    setRemainingUploads(isGuest ? Math.max(0, guestCount - dailyUploads) : Math.max(0, userCount - dailyUploads));
  }, [isGuest]);

  const resizeImage = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        800, // max width
        800, // max height
        "JPG", // output format
        100, // quality
        0, // rotation
        (uri) => resolve(uri), // callback with resized image as URI
        "file" // output type
      );
    });
  const handleFileChange = async (e) => {
    handleUploadAgain();
    const uploadedFile = e.target.files[0];
    if (uploadedFile?.size > 5000000) {
      alert("Please upload a file smaller than 5MB.");
      return;
    }
    try {
      console.log("image size before");
      console.log(uploadedFile?.size);
      const resizedImage = await resizeImage(uploadedFile);
      console.log("image size after");
      console.log(resizedImage?.size);
      setFile(resizedImage);
      setError("");
      return;
    } catch (err) {
      console.error("Error resizing image:", err);
      setError("Failed to process the image. Please try again.");
    }
  };

  const extractNutritionInfo = (caption) => {
    const sanitizeValue = (value) => {
      return value
        .replace(/Approximately/gi, "")
        .replace(/calories/gi, "")
        .replace(/grams?\b/gi, "g")
        .trim();
    };

    const titleMatch = caption.match(/\*\*Food Name:\*\* (.*?)(?:\n|$)/);
    const caloriesMatch = caption.match(/\*\*Calories:\*\* (.*?)(?:\n|$)/);
    const carbsMatch = caption.match(/\*\*Carbohydrates:\*\* (.*?)(?:\n|$)/);
    const proteinMatch = caption.match(/\*\*Protein:\*\* (.*?)(?:\n|$)/);
    const fatMatch = caption.match(/\*\*Fat:\*\* (.*?)(?:\n|$)/);

    return {
      title: titleMatch ? sanitizeValue(titleMatch[1]) : "Unknown",
      calories: caloriesMatch ? sanitizeValue(caloriesMatch[1]) : "N/A",
      carbs: carbsMatch ? sanitizeValue(carbsMatch[1]) : "N/A",
      protein: proteinMatch ? sanitizeValue(proteinMatch[1]) : "N/A",
      fat: fatMatch ? sanitizeValue(fatMatch[1]) : "N/A",
    };
  };
  const handleUpload = async () => {
    if (file?.length === 0) {
      alert("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    const imagename = `${uuid()}-uploaded-image.jpg`; // Unique file name
    var url;
    try {
      url = await uploadFileToS3(imagename, file);
      setImageUrl(url); // Set the S3 URL to display the image
      const generatedCaption = await GetImageCaption(url);

      const nutritionData = extractNutritionInfo(generatedCaption);
      setNutritionInfo(nutritionData);
      await saveDataToDB(nutritionData, url, generatedCaption);
      setUploaded(true);
      // Update daily uploads in local storage
      const today = new Date().toISOString().split("T")[0];
      const recipeData = JSON.parse(secureLocalStorage.getItem("UploadrecipeData")) || {};
      const userKey = JSON.parse(secureLocalStorage.getItem("loggedInUser"))?.email || "guest";

      if (!recipeData[today]) {
        recipeData[today] = {};
      }
      recipeData[today][userKey] = (recipeData[today][userKey] || 0) + 1;

      secureLocalStorage.setItem("UploadrecipeData", JSON.stringify(recipeData));
      setRemainingUploads((prev) => prev - 1); // Update remaining uploads
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setFile([]);
      setCaption("");
      setNutritionInfo({ title: "Image", calories: "", carbs: "", protein: "", fat: "" });
      setUploaded(false);
      setError("Failed to get the image information. Please try again.");
      await saveDataToDB(nutritionInfo, url, error);
    } finally {
      setLoading(false);
    }
  };
  const GetImageCaption = async (imageUrl) => {
    try {
      var generatedCaption;
      if (config.image_caption_ai_service.toLowerCase() === "openai") {
        generatedCaption = await imagetoCaptionUsingOpenAI(imageUrl);
      } else {
        generatedCaption = await imagetoCaption(imageUrl);
      }

      setCaption(generatedCaption); // Update the caption state
      return generatedCaption;
    } catch (err) {
      console.error("Error generating caption:", err);
      setError("Failed to generate a caption for the image.");
    }
  };
  const handleUploadAgain = () => {
    setFile([]);
    setImageUrl("");
    setCaption("");
    setError("");
    setUploaded(false); // Reset upload status
    setNutritionInfo({ title: "", calories: "", carbs: "", protein: "", fat: "" });
  };

  const saveDataToDB = async ({ title, calories, carbs, protein, fat }, imageUrl, generatedCaption) => {
    const addRecipe = {
      id: uuid(), // Unique ID for the data
      title,
      calories,
      carbs,
      protein,
      fat,
      recipeText: generatedCaption,
      image: imageUrl,
      type: "recipe-ai-food-calorie",
      email: userKey,
      ainame: config.image_caption_ai_service,
      date: new Date().toISOString().replace("T", " ").split(".")[0], // Current timestamp
    };

    try {
      await addData(addRecipe);
      console.log("Data saved successfully:", addRecipe);
    } catch (error) {
      console.error("Error saving data to DB:", error);
      setError("Failed to save data to the database.");
    }
  };
  function openCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } }) // Rear Camera
        .then((stream) => {
          console.log("Camera opened", stream);
        })
        .catch((error) => {
          console.error("Error opening camera:", error);
          alert("Camera access is not allowed or not supported.");
        });
    } else {
      alert("Camera not supported on this browser.");
    }
  }

  return (
    <div className="container">
      <h5 className="" align="center">
        <span className="p-1 px-2 ">Capture the Calories!</span>
      </h5>
      <p className="mb-0"> Select or Captue Food Image and Upload</p>
      <div className="form-group d-flex align-items-center">
        <label htmlFor="fileUpload" className="mr-2 d-none">
          Select Image:
        </label>
        <div className="border border-warning p-1 rounded w-100" style={{ display: "flex", gap: "10px" }}>
          {/* File Input */}

          <input
            type="file"
            id="fileUpload"
            className="form-control border-0"
            onChange={handleFileChange}
            disabled={loading || uploaded || remainingUploads === 0} // Disable file input if loading or uploaded
            accept="image/*" // Allow only image files
            style={{ flex: 1 }} // Adjust width to align with the camera button
          />
          {!isAndroidWebView ? (
            <>
              {/* ios Camera Button */}
              <button
                type="button"
                className="btn bg-myapp-recipe-ai-warning px-4"
                onClick={() => document.getElementById("cameraInput").click()} // Trigger hidden camera input
                disabled={loading || uploaded || remainingUploads === 0}
              >
                {uploaded || file?.length !== 0 ? <i className="fas fa-check"></i> : <i className="myapp-color-primary fas fa-camera"></i>}
              </button>

              <input type="file" id="cameraInput" className="d-none" onChange={handleFileChange} accept="image/*" capture="environment" />
            </>
          ) : (
            <>
              {/* this is for android */}
              <button
                type="button"
                className="btn bg-myapp-recipe-ai px-4"
                onClick={() => document.getElementById("cameraInput").click()} // Trigger hidden camera input
                disabled={loading || uploaded || remainingUploads === 0}
              >
                {uploaded || file?.length !== 0 ? <i className="fas fa-check"></i> : <i className="myapp-color-warning fas fa-camera"></i>}
              </button>
              <input type="file" id="cameraInput" className="d-none" accept="image/*" onChange={handleFileChange} />
            </>
          )}
        </div>
      </div>
      <p className="mb-0">
        <small>
          Remaining Uploads Today: <b>{remainingUploads}</b>
        </small>
        <span>
          <small>{remainingUploads === 0 ? " Please Try again Tomorrow" : ""}</small>
        </span>
      </p>
      {!uploaded ? (
        <button
          className="btn btn-lg btn-warning bg-myapp-recipe-ai-warning mt-3 px-5 w-100"
          onClick={handleUpload}
          disabled={loading || file?.length === 0 || remainingUploads === 0} // Disable if loading or no file selected
        >
          {loading ? "Uploading..." : remainingUploads === 0 ? "Limit Reached Today" : "Upload"}
        </button>
      ) : (
        <button className="btn btn-lg btn-secondary mt-3 w-100" onClick={handleUploadAgain}>
          Upload Again
        </button>
      )}

      {error && <p className="text-danger mt-3">{error}</p>}
      <div className="bg-light p-2 mt-2 rounded">
        {loading ? (
          <div align="center">
            <Loading />
            <p>
              Calculating Calorie...
              <span className="px-1">
                <i className="fas fa-spinner fa-spin text-success"></i>
              </span>
            </p>
          </div>
        ) : (
          <>
            {imageUrl ? (
              <div className="mt-4">
                <div className="mt-2" align="center">
                  <img src={imageUrl} alt="Uploaded" className="rounded" style={{ maxWidth: "100%", maxHeight: "300px" }} />
                  <NutritionComponent nutritionInfo={nutritionInfo} />
                </div>
              </div>
            ) : (
              //sample before uploading image
              <div className="mt-4">
                <div className="mt-2" align="center">
                  <img src={logo} alt="Uploaded" className="rounded" style={{ maxWidth: "100%", maxHeight: "300px" }} />
                  <NutritionComponent nutritionInfo={[]} />
                </div>
              </div>
            )}

            {caption && (
              <div className="mt-4">
                <p>{formatRecipe(caption)}</p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-3">
        <CalorieHistoryComponent showLatest={true} />
      </div>
    </div>
  );
};

export default ImageUpload;
