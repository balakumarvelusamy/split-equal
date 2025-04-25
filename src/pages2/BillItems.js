import React from "react";

const BillItems = ({ items }) => {
  if (!items) return null;

  return (
    <div className="mt-4">
      <h4>🧾 Bill Details - {items.shop_name || "Unknown Shop"}</h4>
      <table className="table table-bordered mt-3">
        <thead className="table-light">
          <tr>
            <th>Item</th>
            {/* <th>Quantity</th> */}
            <th>Price</th>
            {/* <th>Total</th> */}
          </tr>
        </thead>
        <tbody>
          {items.items?.map((item, index) => (
            <tr key={index}>
              <td>{item.item_name || "-"}</td>
              {/* <td>{item.quantity || "-"}</td> */}
              <td>{item.price || item.total}</td>
              {/* <td>{item.total || "-"}</td> */}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 p-3 border rounded bg-light">
        <p className="mb-0">
          <strong>Sub Total:</strong> ${items.subtotal || items.order_total || "0.00"}
        </p>
        <p className="mb-0">
          <strong>Tax:</strong> ${items.tax || items.food_tax || items.sales_tax || "0.00"}
        </p>

        <p className="mb-0">
          <strong>Grand Total:</strong> ${items.total || items.grand_total || "0.00"}
        </p>
        <p className="mb-0">
          <strong>Tip:</strong> ${items.tip || "0.00"}
        </p>

        {items.date && (
          <p>
            <strong>Date:</strong> {items.date}
          </p>
        )}
      </div>
    </div>
  );
};

export default BillItems;
