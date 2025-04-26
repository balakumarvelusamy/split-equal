import React from "react";

const GroupSummary = ({ group, page, loggedInUser, calculateAmountOwedToMember }) => {
  return (
    <div className="mt-2">
      {group?.members
        ?.filter((member) => member.email !== loggedInUser?.email)
        .map((member) => {
          const amountOwed = calculateAmountOwedToMember(member.email);
          if (Math.abs(amountOwed) > 0.01) {
            const message = amountOwed > 0 ? `You owe <b>${member.name}</b> (You Pay)` : `<b>${member.name}</b> owes you (You Receive)`;
            return (
              <div key={member.email} className="d-flex justify-content-between py-0">
                <small className="mb-0">
                  <div contentEditable={false} dangerouslySetInnerHTML={{ __html: message }}></div>
                </small>
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
