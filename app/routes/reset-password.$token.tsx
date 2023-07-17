/** @format */

import type { V2_MetaFunction } from '@vercel/remix';
import { Form, useActionData, Link, useParams, useLoaderData } from '@remix-run/react';
import { decodeToken } from 'react-jwt';
import { storage } from '~/utils/session.server';
import { redirect, LoaderArgs, ActionArgs } from '@remix-run/node';

// export const config = { runtime: 'edge' };

export const meta: V2_MetaFunction = () => [{ title: 'Forgot Password' }];

export async function loader({ request, params }: LoaderArgs) {
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

  const checkTokenReset = async () => {
    try {
      const res = await fetch(`http://103.175.216.182:4000/api/v1/auth/check-token/${params.token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.json();
    } catch (error) {
      return error;
    }
  };

  const response = await checkTokenReset();

  return response;
}

export const action = async ({ request }: ActionArgs) => {
  // Get the form data from the request
  const body = await request.formData();

  const resetPassword = async () => {
    try {
      // const email = useLoaderData();
      const res = await fetch('http://103.175.216.182:4000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.get('email'),
          password: body.get('password'),
          confirmPassword: body.get('confirmPassword'),
        }),
      });
      return res.json();
    } catch (error) {
      return error;
    }
  };

  const response = await resetPassword();

  if (response.status === 'success') {
    return redirect('/login');
  }

  console.log('ini data', response);
  // console.log(decodedToken);

  return response;
};

const resetPasswordContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
};

const resetPasswordFormStyle: React.CSSProperties = {
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

export default function ResetPassword() {
  const tokenStatus = useLoaderData();
  const respResetPassword = useActionData<typeof action>();
  return (
    <div style={resetPasswordContainerStyle} className='reset-password-container'>
      <h2>Reset Password</h2>
      <Form style={resetPasswordFormStyle} className='reset-password-form' method='post'>
        <label htmlFor='password' style={labelStyle}>
          New Password:
        </label>
        <input type="hidden" id='email' name="email" value={tokenStatus?.email} />
        <input
          type='password'
          id='password'
          {...(tokenStatus?.status == 'error' ? { disabled: true } : {})}
          name='password'
          style={inputStyle}
        />
        <br />
        <label htmlFor='confirmPassword' style={labelStyle}>
          Confirm Password:
        </label>
        <input
          type='password'
          id='confirmPassword'
          {...(tokenStatus?.status == 'error' ? { disabled: true } : {})}
          name='confirmPassword'
          style={inputStyle}
        />
        <br />
        <button type='submit' style={buttonStyle}>
          Reset Password
        </button>
      </Form>
      {respResetPassword?.status == 'error' && <p>{respResetPassword?.message}</p>}
			{respResetPassword?.status == 'success' && <p>{respResetPassword?.message}</p>}
    </div>
  );
}
