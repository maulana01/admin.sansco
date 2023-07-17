/** @format */

import type { V2_MetaFunction } from '@vercel/remix';
import { Form, useActionData, Link } from '@remix-run/react';
import { Session,redirect, LoaderArgs, ActionArgs } from '@remix-run/node';
import { decodeToken } from 'react-jwt';
import { createUserSession, storage } from '~/utils/session.server';
import React from 'react';

// export const config = { runtime: 'edge' };

export const meta: V2_MetaFunction = () => [{ title: 'Login Page' }];

export async function loader({ request }: LoaderArgs) {
  // Parse cookies from the request headers
  const session = await storage.getSession(request.headers.get('Cookie'));
  const getToken = session.get("token");

  if (getToken) {
    const decodedToken = decodeToken(getToken) as { role: string } | null;

    if (decodedToken && decodedToken.role == 'OWNER') {
      return redirect('/owner/');
    } else if (decodedToken && decodedToken.role == 'KOKI') {
      return redirect('/koki/');
    } else if (decodedToken && decodedToken.role == 'KASIR') {
      return redirect('/kasir/');
    }
  }
  return null;
}

export const action = async ({ request }: ActionArgs) => {
  // Get the form data from the request
  const body = await request.formData();

  // Use the `get` method to get the value of the form field
  const newUser = {
    email: body.get('email'),
    password: body.get('password'),
  };

  const login = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      return res.json();
    } catch (error) {
      return error;
    }
  };

  const response = await login();

  if (response.status != 'error') {
    // const cookie = await userPrefs.serialize({ token: response.data.token });
    // return redirect('/', {
    // 	headers: {
    // 		'Set-Cookie': cookie,
    // 	},
    // });
    const decodedToken = decodeToken(response.data.token) as { role: string } | null;

    if (decodedToken && decodedToken.role == 'OWNER') {
      return createUserSession(response.data.token, '/owner/');
    } else if (decodedToken && decodedToken.role == 'KOKI') {
      return createUserSession(response.data.token, '/koki/');
    } else if (decodedToken && decodedToken.role == 'KASIR') {
      return createUserSession(response.data.token, '/kasir/');
    }
  }

  console.log('ini data', response);
  // console.log(decodedToken);

  return response;
};

const loginContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
};

const loginFormStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const labelStyle: React.CSSProperties = {
  marginBottom: '0.5rem',
};

const inputStyle: React.CSSProperties = {
  padding: '0.5rem',
  marginBottom: '1rem',
  width: '200px',
};

const loginButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  marginTop: '1rem',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const forgotPasswordButtonStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: '#007bff',
  border: 'none',
};

export default function Login() {
  const authCheckStatus = useActionData<typeof action>();
  return (
    <div style={loginContainerStyle}>
      <h2>Login Page</h2>
      <Form style={loginFormStyle} method='post'>
        <label htmlFor='email' style={labelStyle}>
          Email:
        </label>
        <input type='email' id='email' style={inputStyle} name='email' />
        <br />
        <label htmlFor='password' style={labelStyle}>
          Password:
        </label>
        <input type='password' id='password' style={inputStyle} name='password' />
        <br />
        <button
          type='submit'
          style={loginButtonStyle}
        >
          Login
        </button>
        <br />
        <Link
          style={forgotPasswordButtonStyle}
          to={'/forgot-password'}
        >
          Forgot Password
        </Link>
      </Form>
      {authCheckStatus?.status == 'error' && <p>{authCheckStatus?.message}</p>}
    </div>
  );
}
