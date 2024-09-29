import React from 'react';
import styles from '../../../../css/sing-up/sing-up.module.css';
import GoogleLogin from '../../../../src/infrastructure/components/google/GoogleLogin';

export default () => {
  const [isLogin, setIsLogin] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [isLoad, setIsLoad] = React.useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Handle form submission logic here
  };

  return (
    <main className={styles['container-sing-up']}>
      <form onSubmit={handleSubmit} className={styles['container-form-sign-up']}>
        <div>
          <label htmlFor="name">Nombre:</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required />
        </div>
        <div>
          <GoogleLogin
            isLogin={isLogin}
            setData={setData}
            setIsLoad={setIsLoad}
            setIsLogin={setIsLogin}
          />
        </div>
        <div className={styles['container-button-up']}>
          <button type="submit">Create Account</button>
        </div>
      </form>
    </main>
  );
};