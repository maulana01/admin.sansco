/** @format */

import { LoaderArgs, redirect, ActionArgs } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import React, { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import { storage } from '~/utils/session.server';

export async function loader({ request, params }: LoaderArgs) {
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

  const fetchOrderDetail = async () => {
    try {
      const res = await fetch(`http://103.175.216.182:4000/api/v1/orders/order/${params.order_code}`, {
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

  const response = await fetchOrderDetail();
  return response;
}

export const action = async ({ request, params }: ActionArgs) => {
  const body = await request.formData();
  const status = body.get('status');

  if (status === 'Pesanan Sudah Dibayar') {
    const processOrder = async () => {
      try {
        // const email = useLoaderData();
        const res = await fetch(`http://103.175.216.182:4000/api/v1/orders/process-order/${params.order_code}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return res.json();
      } catch (error) {
        return error;
      }
    };

    const response = await processOrder();

    if (response.status === 'success') {
      return redirect('/koki/list-processed-orders');
    }

    // console.log('ini data', response);
  } else {
    const finishOrder = async () => {
      try {
        // const email = useLoaderData();
        const res = await fetch(`http://103.175.216.182:4000/api/v1/orders/finish-order/${params.order_code}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return res.json();
      } catch (error) {
        return error;
      }
    };

    let response = await finishOrder();

    if (response.status === 'success') {
      return redirect('/koki/list-finished-orders');
    }

    // console.log('ini data', response);
  }

  return null;
};

const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
  const buttonElement = event.currentTarget as HTMLButtonElement;
  buttonElement.style.backgroundColor = (styles.buttonHover as React.CSSProperties).backgroundColor!;
};

const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
  const buttonElement = event.currentTarget as HTMLButtonElement;
  buttonElement.style.backgroundColor = (button as React.CSSProperties).backgroundColor!;
};

const rupiah: any = (number: any) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(number);
};

export default function OrderDetails() {
  const { data } = useLoaderData();

  return (
    <div style={main}>
      <div style={helper}>
        <h2>Detail Pesanan</h2>
      </div>
      <div style={styles.details}>
        <p style={styles.detailItem}>
          <span style={styles.label}>Kode Pesanan</span> <span style={{ fontWeight: 'bold', marginLeft: '5.25rem' }}>:</span>{' '}
          {data.Pesanan.order_code}
        </p>
        <p style={styles.detailItem}>
          <span style={styles.label}>Nomor Meja</span> <span style={{ fontWeight: 'bold', marginLeft: '6.4rem' }}>:</span>{' '}
          {data.Pesanan.table_number}
        </p>
        <p style={styles.detailItem}>
          <span style={styles.label}>Total Bayar</span> <span style={{ fontWeight: 'bold', marginLeft: '7.1rem' }}>:</span>{' '}
          {rupiah(data.Pesanan.payment_amount)}
        </p>
        <p style={styles.detailItem}>
          <span style={styles.label}>Status</span> <span style={{ fontWeight: 'bold', marginLeft: '10.85rem' }}>:</span> {data.Pesanan.status}
        </p>
        <p style={styles.detailItem}>
          <span style={styles.label}>Nama</span> <span style={{ fontWeight: 'bold', marginLeft: '11.1rem' }}>:</span> {data.Pesanan.name}
        </p>
        <p style={styles.detailItem}>
          <span style={styles.label}>Metode Pembayaran</span> <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>:</span>
          {data.Pesanan.payment_method.charAt(0).toUpperCase()}
          {data.Pesanan.payment_method.slice(1)}
        </p>
        <p style={styles.detailItem}>
          <span style={styles.label}>Detail Pesanan</span> <span style={{ fontWeight: 'bold', marginLeft: '4.35rem' }}>:</span>
        </p>
        <ul style={styles.detailsOrder}>
          {data['Detail Pesanan'].map((item: any) => (
            <li key={item.id}>
              <p style={styles.detailItem}>
                <span style={styles.label}>- {item.menu_ref.name}</span> (x{item.qty})
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div style={styles.buttonContainer}>
        <Form method='post'>
          {data.Pesanan.status === 'Pesanan Sudah Dibayar' ? (
            <button
              type='submit'
              name='status'
              style={button}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              value={data.Pesanan.status}
            >
              Proses Pesanan
            </button>
          ) : data.Pesanan.status === 'Pesanan Sedang Diproses' ? (
            <button
              type='submit'
              name='status'
              style={button}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              value={data.Pesanan.status}
            >
              Selesaikan Pesanan
            </button>
          ) : (
            <button style={{ display: 'none' }}></button>
          )}
        </Form>
        <button style={button} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {data.Pesanan.status === 'Pesanan Sudah Dibayar' ? (
            <a href='/koki' style={styles.buttonLink}>
              Kembali
            </a>
          ) : data.Pesanan.status === 'Pesanan Sedang Diproses' ? (
            <a href='/koki/list-processed-orders' style={styles.buttonLink}>
              Kembali
            </a>
          ) : (
            <a href='/koki/list-finished-orders' style={styles.buttonLink}>
              Kembali
            </a>
          )}
        </button>
      </div>
    </div>
  );
}

const helper: React.CSSProperties = {
  fontSize: '1.5rem',
  marginBottom: '1rem',
  marginLeft: '1rem',
  color: '#333',
  // alignSelf:'flex-start'
};

const main: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column', // Set flex direction to column
  justifyContent: 'center',
  alignItems: 'flex-start',
  flex: 1,
  height: '100vh',
  background: '#f5f5f5',
  width: '80vw',
};

const button: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.5rem 1rem',
  backgroundColor: '#f5f5f5',
  border: '1px solid #ccc',
  borderRadius: '5px',
  color: '#333',
  textDecoration: 'none',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  textAlign: 'center',
  cursor: 'pointer',
  margin: '0 0.5rem', // Add margin between buttons
};

const styles = {
  details: {
    fontSize: '1.5rem',
    marginLeft: '1rem',
  },
  detailItem: {
    marginBottom: '0.5rem',
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    marginRight: '0.5rem',
  },
  detailsOrder: {
    height: '20vh',
    overflow: 'auto',
    marginBottom: '2rem',
  },
  buttonHover: {
    backgroundColor: '#ccc', // Adjust the background color for the hover effect
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  buttonLink: {
    color: '#333',
  },
};