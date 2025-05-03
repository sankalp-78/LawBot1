import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home">
      <h1>Law Chatbot</h1>
      {user ? <p>Welcome back! Start chatting.</p> : <p>Please log in or register.</p>}
    </div>
  );
};

export default Home;