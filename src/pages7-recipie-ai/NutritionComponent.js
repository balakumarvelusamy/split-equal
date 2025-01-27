import React, { useState, useEffect } from "react";
import { getData_Any2Column, formatRecipe } from "../service/APIService";
const NutritionComponent = ({ nutritionInfo }) => {
  useEffect(() => {}, []);

  return (
    <div>
      {" "}
      <div className=" rounded  mt-3">
        <div className="d-flex justify-content-between">
          <span className="p-1 mb-0 alert alert-warning w-50">
            <small className="mb-0">
              <i class="fas fa-fire px-1 "></i>Calories
              <p className="mb-0">{nutritionInfo.calories}</p>
            </small>
          </span>
          <span className="p-1 mb-0 mx-1 alert alert-secondary w-50">
            <small className="mb-0">
              <i class="fas fa-seedling px-1"></i>Carbs
              <p className="mb-0">{nutritionInfo.carbs}</p>
            </small>
          </span>
        </div>
        <div className="mt-1 d-flex justify-content-between">
          <span className="p-1 mb-0 alert alert-success w-50">
            <small className="mb-0">
              <i class="fas fa-drumstick-bite px-1"></i>Protein
              <p className="mb-0">{nutritionInfo.protein}</p>
            </small>
          </span>
          <span className="p-1 mb-0 mx-1 alert alert-danger w-50">
            <small className="mb-0">
              <i class="fas fa-cheese px-1"></i>Fat
              <p className="mb-0">{nutritionInfo.fat}</p>
            </small>
          </span>
        </div>
      </div>
    </div>
  );
};

export default NutritionComponent;
