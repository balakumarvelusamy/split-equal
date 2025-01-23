import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";

const BarChartComponent = ({ data, title }) => {
  // Transform the data into the structure expected by Recharts
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: Number(data.values[index].toFixed(0)),
  }));

  return (
    <div style={{ textAlign: "center", margin: "5px" }}>
      {/* {title && <h3>{title}</h3>} */}
      <div style={{ width: "100%", height: 300 }}>
        {console.log("chartData", chartData)}
        <ResponsiveContainer>
          <BarChart
            style={{ fontSize: "13px", fill: "#000" }}
            data={chartData}
            margin={{ top: 30, right: 1, left: 1, bottom: 5 }} // Adjust left margin
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              interval={0} // Show all labels
              angle={-35} // Rotate labels 45 degrees counterclockwise
              textAnchor="end" // Align text at the end of the label
              height={90} // Increase height to prevent label clipping
            />
            <YAxis
              width={60} // Fixed width for Y-axis
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value;
              }}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#008585">
              <LabelList dataKey="value" position="top" style={{ fontSize: "11px", fill: "#000" }} angle={-0} /> {/* Show values on top of bars */}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartComponent;
