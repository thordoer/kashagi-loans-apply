import Login from "../assets/Login";

function Signin({ sendDetails, client, setpin }) {
  return (
    <div>
      <Login client={client} setpin={setpin} sendDetails={sendDetails} />
    </div>
  );
}

export default Signin;
