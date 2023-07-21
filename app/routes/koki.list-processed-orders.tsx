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

  if (decodedToken && decodedToken.role == 'OWNER') {
    return redirect('/owner/');
  } else if (decodedToken && decodedToken.role == 'KASIR') {
    return redirect('/kasir/');
  }
  return null;
}

export default function ProcessedOrdes() {
  const [processedOrder, setProcessedOrder] = useState([]);
  useEffect(() => {
    const fetchProcessedOrder = async () => {
      const response = await fetch('http://103.175.216.182:4000/api/v1/orders/processed-orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setProcessedOrder(data.data);
      return data;
    };

    fetchProcessedOrder().then((data: any) => {
      setProcessedOrder(data.data);
    });

    return;
  }, []);

  return (
    <div style={main}>

      <link href='https://cdn.jsdelivr.net/npm/remixicon@3.2.0/fonts/remixicon.css' rel='stylesheet' />
      <div style={helper}>
        <h2 style={heading}>Data Pesanan yang Sedang Diproses</h2>
      </div>
      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Kode Pesanan</th>
              <th style={th}>Nomor Meja</th>
              <th style={th}>Total Bayar</th>
              <th style={th}>Nama</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(processedOrder) &&
              processedOrder.map((order: any) => (
                <tr key={order.id}>
                  <td style={td}>{order.order_code}</td>
                  <td style={td}>{order.table_number}</td>
                  <td style={td}>{order.payment_amount}</td>
                  <td style={td}>{order.name}</td>
                  <td style={td}>
                    <a style={buttonDetail} href={`/koki/details/${order.order_code}`}>Detail</a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* <span style={span}>Breakpoints on 900px and 400px</span> */}
      <div style={paginationContainer}>
        <div style={pagination}>
          <span style={paginationItem}>
            <i className='ri-arrow-left-line'></i>
          </span>
          <div style={{ margin: '0 0.5rem' }}>Page 1 of 1</div>
          <span style={paginationItem}>
            <i className='ri-arrow-right-line'></i>
          </span>
        </div>
      </div>
    </div>
  );
}

const main: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start', // Align items to the top of the container
  alignItems: 'center',
  flex: 1,
  height: '100vh',
  backgroundColor: '#f5f5f5',
  width: '80vw',
  padding: '2rem 0 0 2rem',
  boxSizing: 'border-box', // Add this line to include padding in width and height
};

const helper: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start', // Align heading to the top left
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#333',
  width: '100%', // Ensure the heading takes full width
};

const heading: React.CSSProperties = {
  marginBottom: '1rem',
  textAlign: 'left',
};

const tableContainer: React.CSSProperties = {
  width: '100%',
  overflow: 'auto',
  maxHeight: '82%',
};

const table: React.CSSProperties = {
  width: '100%',
  maxWidth: '97%',
  borderCollapse: 'collapse',
  background: '#fff',
  borderRadius: '5px',
  overflow: 'hidden',
  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
  marginBottom: '1rem',
  fontSize: '0.9rem',
  fontWeight: 400,
  color: '#333',
};

const th: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid #ddd',
  padding: '10px',
  textAlign: 'left',
};

const td: React.CSSProperties = {
  borderBottom: '1px solid #ddd',
  padding: '10px',
  textAlign: 'left',
};

const paginationContainer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center', // Center the pagination horizontally
  width: '70vw',
  backgroundColor: '#f5f5f5',
  position: 'absolute',
  bottom: '1rem', // Adjust the distance from the bottom as needed
};

const pagination: React.CSSProperties = {
  listStyle: 'none',
  display: 'flex',
  alignItems: 'center',
  margin: 0,
  padding: 0,
};

const paginationItem: React.CSSProperties = {
  margin: '0 0.5rem',
  cursor: 'pointer',
};

const buttonDetail:React.CSSProperties = {
  backgroundColor: '#4CAF50',
  border: 'none',
  color: 'white',
  padding: '5px 10px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '12px',
  borderRadius: '5px',
}