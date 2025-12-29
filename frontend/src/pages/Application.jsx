import Apply from "../assets/Apply";
import LoanApplication from "../assets/LoanApplication";

function Application({ myFuncs, client }) {
  return (
    <div>
      <Apply myFuncs={myFuncs} client={client} />

      {/* <LoanApplication /> */}
    </div>
  );
}

export default Application;
