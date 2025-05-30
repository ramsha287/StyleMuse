import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { name, email, password };

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      if (response.status === 201) {
        // Redirect to login
        navigate('/login');
      }
    } catch (err) {
      setError('Registration failed! Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="bg-linen p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-stone">Register</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-stone">Name</label>
            <input
              type="text"
              id="name"
              className="w-full mt-2 p-3 bg-white text-stone border border-stone rounded-md focus:outline-none focus:ring-2 focus:ring-beige"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-stone">Email</label>
            <input
              type="email"
              id="email"
              className="w-full mt-2 p-3 bg-white text-stone border border-stone rounded-md focus:outline-none focus:ring-2 focus:ring-beige"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-stone">Password</label>
            <input
              type="password"
              id="password"
              className="w-full mt-2 p-3 bg-white text-stone border border-stone rounded-md focus:outline-none focus:ring-2 focus:ring-beige"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-taupe text-stone font-semibold rounded-md hover:bg-[#9B9482] focus:outline-none focus:ring-2 focus:ring-beige"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
