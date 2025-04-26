import React from "react";

const GroupSummary = ({ group, page, loggedInUser, calculateAmountOwedToMember_ }) => {
  return (
    <div className="mt-0">
      {group?.members
        ?.filter((member) => member.email !== loggedInUser?.email)
        .map((member, index, array) => {
          const amountOwed = calculateAmountOwedToMember_(member.email);
          if (Math.abs(amountOwed) > 0.01) {
            const isLast = index === array.length - 1;
            const message = amountOwed > 0 ? `You owe <b>${member.name}</b>` : `<b>${member.name}</b> owes you`;
            return (
              <div key={member.email} className={`${isLast ? "member-connection-line-last" : "member-connection-line"} d-flex justify-content-between py-0`}>
                <span>
                  <small className="mb-0">
                    <span contentEditable={false} dangerouslySetInnerHTML={{ __html: message }}></span>
                  </small>
                </span>{" "}
                <span>
                  {page === "home" ? (
                    <small className={`fw-bold ${amountOwed > 0 ? "text-danger" : "text-sucess"}`}>
                      {group?.currency}
                      {Math.abs(amountOwed).toFixed(2)}
                    </small>
                  ) : (
                    <small className={`fw-bold ${amountOwed > 0 ? "myapp-text-danger" : "myapp-text-sucess"}`}>
                      {group?.currency}
                      {Math.abs(amountOwed).toFixed(2)}
                    </small>
                  )}
                </span>
              </div>
            );
          }
          return null;
        })
        .filter(Boolean)}
    </div>
  );
};

export default GroupSummary;
