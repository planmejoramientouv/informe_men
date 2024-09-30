import React from 'react';
import styles from '../../../../css/sing-in/sing-in.module.css'
import GoogleLogin from '../google/GoogleLogin';

export default () => {

    const [isLogin, setIsLogin] = React.useState([])
    const [data, setData] = React.useState([])
    const [isLoad, setIsLoad] = React.useState([])
    
    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <form onSubmit={handleSubmit} className={styles['container-form-sign-in']}>
          <div>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div>
          </div>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
    );
}