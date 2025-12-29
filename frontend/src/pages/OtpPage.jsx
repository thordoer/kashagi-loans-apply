import OtpVerification from "../assets/Otp";

function OtpPage({ client, myFuncs }) {
  return (
    <div>
      <OtpVerification client={client} myFuncs={myFuncs} />
    </div>
  );
}

export default OtpPage;
