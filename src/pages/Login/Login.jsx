import "./Login.css";
import assets from "../../assets/assets";
import { useState } from "react";
import { signup, login, resetPass } from "../../config/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Example usage of React Icons
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const Login = () => {
  const [currState, setCurrState] = useState("Login");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

        {/* Password input with toggle icon using React Icons */}
        <div className="password-input-wrapper">
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="form-input"
            required
          />
          {showPassword ? (
            <MdVisibilityOff
              onClick={() => setShowPassword(false)}
              className="toggle-password-icon"
            />
          ) : (
            <MdVisibility
              onClick={() => setShowPassword(true)}
              className="toggle-password-icon"
            />
          )}
        </div>

        <button type="submit">
          {currState === "Login" ? "Login" : "Create account"}
        </button>

        <div className="login-term">
          <input type="checkbox" />
          <p>Accept terms of use and privacy policy</p>
        </div>

        <div className="login-forgot">
          {currState === "Login" ? (
            <p className="login-toogle">
              Create an account
              <span onClick={() => setCurrState("Sign up")}> click here</span>
            </p>
          ) : (
            <p className="login-toogle">
              Already have an account
              <span onClick={() => setCurrState("Login")}> Login here</span>
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
