/** @format */

import type { V2_MetaFunction } from '@vercel/remix';
import { Form, useActionData, Link } from '@remix-run/react';
import { decodeToken } from 'react-jwt';
import { storage } from '~/utils/session.server';
import { redirect, LoaderArgs, ActionArgs } from '@remix-run/node';

// export const config = { runtime: 'edge' };

export const meta: V2_MetaFunction = () => [{ title: 'Forgot Password' }];

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

  const sendForgotPasswordToken = async () => {
    try {
      const res = await fetch('http://103.175.216.182:4000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
					email: body.get('email')
				}),
      });
      return res.json();
    } catch (error) {
			return error;
		}
  };

  const response = await sendForgotPasswordToken();

  console.log('ini data', response);
  // console.log(decodedToken);

  return response;
};

const forgotPasswordContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
};

const forgotPasswordFormStyle: React.CSSProperties = {
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

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  marginTop: '1rem',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default function ForgotPassword() {
	const respForgotPassword = useActionData<typeof action>();
  return (
    <div style={forgotPasswordContainerStyle} className='forgot-password-container'>
      <h2>Forgot Password</h2>
      <Form style={forgotPasswordFormStyle} className='forgot-password-form' method='post'>
        <label htmlFor='email' style={labelStyle}>
          Email:
        </label>
        <input type='email' id='email' name='email' style={inputStyle} />
        <br />
        <button type='submit' style={buttonStyle}>
          Submit
        </button>
      </Form>
			{respForgotPassword?.status == 'error' && <p>{respForgotPassword?.message}</p>}
			{respForgotPassword?.status == 'success' && <p>{respForgotPassword?.message}</p>}
    </div>
  );
}
