/** @format */

import { LoaderArgs, redirect, ActionArgs } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import React, { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import { storage } from '~/utils/session.server';
import type { V2_MetaFunction } from '@vercel/remix';

export const meta: V2_MetaFunction = () => [{ title: 'Detail Pesanan | Dashboard Owner' }];

export async function loader({ request, params }: LoaderArgs) {
  // Parse cookies from the request headers
  const session = await storage.getSession(request.headers.get('Cookie'));
  const getToken = session.get('token');

  // If the user is not logged in, redirect them to the login page
  if (!getToken) {
    return redirect('/login');
  }

  const decodedToken = decodeToken(getToken) as { role: string } | null;

  if (decodedToken && decodedToken.role == 'KASIR') {
    return redirect('/kasir/');
  } else if (decodedToken && decodedToken.role == 'KOKI') {
    return redirect('/koki/');
  }

  const fetchOrderDetail = async () => {
    try {
      const res = await fetch(`https://mail.apisansco.my.id/api/v1/orders/order/${params.order_code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      // console.log('Data fetched:', data);
      return data;
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

  if (status === 'Batalkan Pesanan') {
    const cancelOrder = async () => {
      try {
        // const email = useLoaderData();
        const res = await fetch(`https://mail.apisansco.my.id/api/v1/orders/cancel-order/${params.order_code}`, {
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

    const response = await cancelOrder();

    if (response.status === 'success') {
      return redirect('/owner/orders/');
    }

    // console.log('ini data', response);
  } else {
    const confirmPayOrder = async () => {
      try {
        // const email = useLoaderData();
        const res = await fetch(`https://mail.apisansco.my.id/api/v1/orders/pay-order/${params.order_code}`, {
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

    let response = await confirmPayOrder();

    if (response.status === 'success') {
      return redirect('/owner/orders/');
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

const formatDateToDDMMYYYY: any = (dateString: any) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export default function OrderDetails() {
  const { data } = useLoaderData();

  return (
    <div style={main}>
      {data ? (
        <div>
          <div style={helper}>
            <h2 style={heading}>Detail Pesanan</h2>
          </div>
          <div style={styles.details}>
            <p style={styles.detailItem}>
              <span style={styles.label}>Kode Pesanan</span> <span style={{ fontWeight: 'bold', marginLeft: '5.25rem' }}>:</span>{' '}
              {data.Pesanan.order_code}
            </p>
            <p style={styles.detailItem}>
              <span style={styles.label}>Dibuat Pada</span> <span style={{ fontWeight: 'bold', marginLeft: '6.55rem' }}>:</span>{' '}
              {formatDateToDDMMYYYY(data.Pesanan.createdAt)}
            </p>
            <p style={styles.detailItem}>
              <span style={styles.label}>Nomor Meja</span> <span style={{ fontWeight: 'bold', marginLeft: '6.4rem' }}>:</span>{' '}
              {data.Pesanan.table_number}
            </p>
            <p style={styles.detailItem}>
              <span style={styles.label}>Total Bayar</span> <span style={{ fontWeight: 'bold', marginLeft: '7.1rem' }}>:</span>{' '}
              {data.Pesanan.payment_amount ? rupiah(data.Pesanan.payment_amount) : '-'}
            </p>
            <p style={styles.detailItem}>
              <span style={styles.label}>Status</span> <span style={{ fontWeight: 'bold', marginLeft: '10.85rem' }}>:</span>{' '}
              {data.Pesanan.status}
            </p>
            <p style={styles.detailItem}>
              <span style={styles.label}>Nama</span> <span style={{ fontWeight: 'bold', marginLeft: '11.1rem' }}>:</span>{' '}
              {data.Pesanan.name ? data.Pesanan.name : '-'}
            </p>
            <p style={styles.detailItem}>
              <span style={styles.label}>Metode Pembayaran</span> <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>:</span>
              {data.Pesanan.payment_method ? data.Pesanan.payment_method.charAt(0).toUpperCase() : '-'}
              {data.Pesanan.payment_method ? data.Pesanan.payment_method.slice(1) : ''}
            </p>
            {data.Pesanan.user_ids ? (
              <p style={styles.detailItem}>
                <span style={styles.label}>Pesanan Dibuat Oleh</span> <span style={{ fontWeight: 'bold', marginLeft: '-0.15rem' }}>:</span>{' '}
                {data.ProcessedBy}
              </p>
            ) : (
              ''
            )}
            <p style={styles.detailItem}>
              <span style={styles.label}>Detail Pesanan</span> <span style={{ fontWeight: 'bold', marginLeft: '4rem' }}>:</span>
            </p>
            <ul style={styles.detailsOrder}>
              {data.Pesanan.payment_amount &&
                data['Detail Pesanan'].map((item: any) => (
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
              {data.Pesanan.status === 'Menunggu Pembayaran' ? (
                <div>
                  <button
                    type='submit'
                    name='status'
                    style={button}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    value='Batalkan Pesanan'
                  >
                    Batalkan Pesanan
                  </button>
                  <button
                    type='submit'
                    name='status'
                    style={button}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    value='Konfirmasi Pembayaran'
                  >
                    Konfirmasi Pembayaran
                  </button>
                </div>
              ) : (
                <button style={{ display: 'none' }}></button>
              )}
            </Form>
            <button style={button} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <a href='/owner/orders/' style={styles.buttonLink}>
                Kembali
              </a>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={helper}>
            <h2>Pesanan Tidak Ditemukan</h2>
          </div>
        </div>
      )}
    </div>
  );
}

const heading: React.CSSProperties = {
  marginBottom: '1rem',
  textAlign: 'left',
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

const main: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start', // Align items to the top of the container
  flex: 1,
  overflowY: 'auto',
  height: '100vh',
  backgroundColor: '#f5f5f5',
  width: '80vw',
  padding: '2rem 0 0 2rem',
  boxSizing: 'border-box', // Add this line to include padding in width and height
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
    // marginLeft: '1rem',
  },
  detailItem: {
    marginBottom: '1rem',
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
    listStyleType: 'none',
    paddingLeft: '0',
    marginTop: '-0.5em',
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
