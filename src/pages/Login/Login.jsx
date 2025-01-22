import "./Login.css";
import assets from "../../assets/assets";
import { useState } from "react";
import { signup, login, resetPass } from "../../config/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currState === "Sign up") {
      try {
        await signup(userName, email, password);
        toast.success("Account created successfully");
      } catch (err) {
        const errorMessage = err.code.split("/")[1].split("-").join(" ");
        toast.error(capitalizeFirstLetter(errorMessage));
      }
    } else {
      try {
        await login(email, password);
        toast.success("Logged in successfully");
      } catch (err) {
        const errorMessage = err.code.split("/")[1].split("-").join(" ");
        toast.error(capitalizeFirstLetter(errorMessage));
      }
    }
  };

  return (
    <div className="login">
      <ToastContainer />
      <img src={assets.logo_big} alt="Login logo image" className="logo" />
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{currState}</h2>
        {currState === "Sign up" ? (
          <input
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            type="text"
            placeholder="Username"
            className="form-input"
            required
          />
        ) : null}
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="Email Address"
          className="form-input"
          required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="Password"
          className="form-input"
          required
        />
        <button type="submit">
          {currState === "Sign up" ? "Create account" : "Login"}
        </button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Accept terms of use and privacy policy</p>
        </div>
        <div className="login-forgot">
          {currState === "Sign up" ? (
            <p className="login-toogle">
              Already have an account
              <span onClick={() => setCurrState("Login")}> Login here</span>
            </p>
          ) : (
            <p className="login-toogle">
              Create an account
              <span onClick={() => setCurrState("Sign up")}> click here</span>
            </p>
          )}
          {currState === "Login" ? (
            <p className="login-toogle">
              Forgot password?
              <span onClick={() => resetPass(email)}> reset here</span>
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default Login;
