import "./Login.css";
import assets from "../../assets/assets";
const Login = () => {
  return (
    <div className="login">
      <img src={assets.logo_big} alt="Login logo image" className="logo" />
      <form className="login-form">
        <h2>Sign Up</h2>
        <input
          type="text"
          placeholder="username"
          className="form-input"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          className="form-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="form-input"
          required
        />
        <button type="submit">Sign Up</button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Accept terms of use and privacy policy</p>
        </div>
        <div className="login-forgot">
          <p className="login-toogle">
            Already have an account <span>click here</span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
