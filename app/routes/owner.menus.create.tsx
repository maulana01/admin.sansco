/** @format */

import { LoaderArgs, redirect } from '@remix-run/node';
import { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import { storage } from '~/utils/session.server';

export async function loader({ request }: LoaderArgs) {
  // Parse cookies from the request headers
  const session = await storage.getSession(request.headers.get('Cookie'));
  const getToken = session.get('token');

  // If the user is not logged in, redirect them to the login page
  if (!getToken) {
    return redirect('/login');
  }

  const decodedToken = decodeToken(getToken) as { role: string } | null;

  if (decodedToken && decodedToken.role == 'KOKI') {
    return redirect('/koki/');
  } else if (decodedToken && decodedToken.role == 'KASIR') {
    return redirect('/kasir/');
  }
  return null;
}

export default function PaidOrders() {
  const [paidOrder, setPaidOrder] = useState([]);
  useEffect(() => {
    const fetchPaidOrder = async () => {
      const response = await fetch('http://103.175.216.182:4000/api/v1/orders/paid-orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setPaidOrder(data.data);
      return data;
    };

    fetchPaidOrder().then((data: any) => {
      setPaidOrder(data.data);
    });

    return;
  }, []);

  return (
    <div style={main}>
      <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"/>
      <div style={helper}>
        <h2 style={heading}>Data Pesanan yang Sudah Dibayar</h2>
      </div>
      {/* Form section */}
      <div style={formContainer}>
        <form>
          <label style={formLabel} htmlFor='dataInput'>
            Input Data:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input style={formInput} type='text' id='dataInput' name='dataInput' />
            <button style={submitButton} type='submit'>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const main: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flex: 1,
  height: '100vh',
  backgroundColor: '#f5f5f5',
  width: '80vw',
  padding: '2rem 0 0 2rem',
  boxSizing: 'border-box',
};

const helper: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#333',
  width: '100%',
};

const heading: React.CSSProperties = {
  marginBottom: '1rem',
  textAlign: 'left',
};

const formContainer: React.CSSProperties = {
  width: '100%',
};

const formLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '1rem',
  fontWeight: 600,
  color: '#333',
  marginBottom: '0.5rem',
};

const formInput: React.CSSProperties = {
  width: '90%', // Change the width as needed
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '0.9rem',
  fontWeight: 400,
  color: '#333',
  marginBottom: '1rem',
  boxSizing: 'border-box',
};

const submitButton: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  border: 'none',
  color: 'white',
  padding: '8px 16px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'block', // Change to 'block' to ensure it stays below the input
  width: '10%', // Added width to make it full-width
  fontSize: '14px',
  borderRadius: '5px',
  cursor: 'pointer',
};
