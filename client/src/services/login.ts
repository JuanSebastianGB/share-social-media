import axios from 'axios';

const url = 'http://localhost:5000/auth/login';

const fetchLogin = async (body: any) => {
  const response = axios.post(url, body);
  return response;
};

export { fetchLogin };
