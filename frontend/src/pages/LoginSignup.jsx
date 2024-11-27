import React, { useState } from 'react';
import './CSS/LoginSignup.css';
import { url } from '../components/Assets/assets';

export const LoginSignup = () => {

  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false); // For the terms and conditions checkbox

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!agreeToTerms) {
      alert("You must agree to the terms of use.");
      return;
    }

    let responseData;
    await fetch(`${url}/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/form',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  };

  const signup = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!agreeToTerms) {
      alert("You must agree to the terms of use.");
      return;
    }

    let responseData;
    await fetch(`${url}/signup`, {
      method: 'POST',
      headers: {
        Accept: 'application/form',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <form className="loginsignup-fields" onSubmit={state === "Login" ? login : signup}>
          {state === "Sign Up" && ( <input type="text" name='username' value={formData.username} onChange={changeHandler} placeholder='Your Name' required/>)}
          <input name='email' value={formData.email} onChange={changeHandler} type="email" placeholder='Email Address' required/>
          <input name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='Password' required/>
          <button type="submit">Continue</button>
        </form>
        {state === "Sign Up"? <p className='loginsignup-login'> Already have an account? <span onClick={() => { setState("Login") }}>Login here</span></p>:<p className='loginsignup-login'>Create an account? <span onClick={() => { setState("Sign Up") }}>Click here</span></p>}
        <div className="loginsignup-agree">
          <input type="checkbox" checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)}/>
          <p>By continuing, I agree to the terms of use & privacy policy</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
