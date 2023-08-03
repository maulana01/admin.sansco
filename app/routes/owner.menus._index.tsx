/** @format */

import type { V2_MetaFunction } from '@vercel/remix';
import { LoaderArgs, redirect } from '@remix-run/node';
import { decodeToken } from 'react-jwt';
import { storage } from '~/utils/session.server';
import React, { useState } from 'react';
import { Form, useLoaderData } from '@remix-run/react';
import { ToastContainer, toast } from 'react-toastify';

// export const config = { runtime: 'edge' };

export const meta: V2_MetaFunction = () => [{ title: 'Home | Dashboard Owner' }];

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

  const fetchMenus = async () => {
    try {
      // const page = 1;
      // const limit = 10;
      const response = await fetch(`https://mail.apisansco.my.id/api/v1/menus/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      // console.log('Data fetched:', data);
      return data;
    } catch (error) {
      // console.log('Error:', error);
    }
  };

  return await fetchMenus();
}

export async function action({ request }: LoaderArgs) {
  // Get the form data from the request
  const body = await request.formData();

  const deletemenu = async () => {
    try {
      const res = await fetch(`https://mail.apisansco.my.id/api/v1/menus/${body.get('id')}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.json();
    } catch (error) {
      return error;
    }
  };

  const response = await deletemenu();

  return response;
}

interface ModalProps {
  onClose: () => void;
  onConfirmDelete: () => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, onConfirmDelete }) => {
  return (
    <div style={modalOverlay}>
      <div style={modalContainer}>
        <h3 style={modalHeading}>Hapus Data</h3>
        <p style={modalText}>Apakah Anda yakin ingin menghapus data Kategori Menu?</p>
        <div style={modalButtons}>
          <button style={modalButton} onClick={onClose}>
            Cancel
          </button>
          <button
            style={modalButton}
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Menus() {
  const menus = useLoaderData();
  const [showModal, setShowModal] = useState(false);
  const [menuIdToDelete, setMenuIdToDelete] = useState<string | null>(null);

  const rupiah: any = (number: any) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(number);
  };

  const notify = (data: string, type: 'success' | 'error' | 'warning' | 'info') => {
    toast[type](data, {
      autoClose: 2000,
      position: toast.POSITION.TOP_RIGHT,
      toastId: 'alertToast',
    });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const onDeleteConfirmed = async () => {
    if (!menuIdToDelete) {
      return;
    }

    const formData = new FormData();
    formData.append('id', menuIdToDelete);

    const response = await action({
      request: new Request('/', { method: 'POST', body: formData }),
      context: {},
      params: {},
    });

    if (response && response.status === 'success') {
      notify('Data menu berhasil dihapus!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } else {
      notify('Data menu gagal dihapus!', 'error');
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }

    // Close the modal after the deletion process
    closeModal();
  };

  return (
    <div style={main}>
      <link href='https://cdn.jsdelivr.net/npm/remixicon@3.2.0/fonts/remixicon.css' rel='stylesheet' />
      <div style={helper}>
        <h2 style={heading}>Data Menu</h2>
      </div>
      {/* create button */}
      <div style={buttonContainer}>
        <a style={button} href='/owner/menus/add'>
          Tambah Data
        </a>
      </div>
      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Nama</th>
              <th style={th}>Gambar</th>
              <th style={th}>Harga</th>
              <th style={th}>Kategori</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {menus.data.map((data: any) => (
              <tr key={data.id}>
                <td style={td}>{data.name}</td>
                <td style={td}>
                  {/* <a href={data.image} target='_blank'>Link Gambar</a> */}
                  <img src={data.image} width={100} alt={data.name} />
                </td>
                <td style={td}>{rupiah(data.price)}</td>
                <td style={td}>{data.items.name}</td>
                <td style={td}>
                  {' '}
                  {/* Move the <div> to a <td> */}
                  <a style={buttonDetail} href={`/owner/menus/edit/${data.id}`}>
                    Update
                  </a>
                  <button
                    style={buttonDelete}
                    onClick={() => {
                      setMenuIdToDelete(data.id);
                      setShowModal(true); // Show the modal when the "Delete" button is clicked
                    }}
                  >
                    Delete
                  </button>
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
      {showModal && <Modal onClose={closeModal} onConfirmDelete={onDeleteConfirmed} />}
      <ToastContainer />
    </div>
  );
}

// Styles for the modal
const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modalContainer: React.CSSProperties = {
  background: '#fff',
  borderRadius: '5px',
  padding: '1rem',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
};

const modalHeading: React.CSSProperties = {
  margin: '0',
  fontSize: '1.2rem',
};

const modalText: React.CSSProperties = {
  margin: '1rem 0',
};

const modalButtons: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
};

const modalButton: React.CSSProperties = {
  padding: '0.5rem 1rem',
  marginLeft: '0.5rem',
  cursor: 'pointer',
};
// Styles for the modal

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
  marginBottom: '0.5rem',
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
  marginBottom: '2rem',
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
  width: '75vw',
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

const buttonDetail: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  border: 'none',
  color: 'white',
  padding: '5px 10px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '12px',
  borderRadius: '5px',
};

const buttonContainer: React.CSSProperties = {
  display: 'flex',
  marginBottom: '0.5rem',
  justifyContent: 'flex-end',
  alignItems: 'center', // Center the pagination horizontally
  width: '73vw',
  backgroundColor: '#f5f5f5',
  // position: 'absolute',
  // top: '1rem', // Adjust the distance from the bottom as needed
};

const button: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  border: 'none',
  color: 'white',
  padding: '5px 10px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '18px',
  borderRadius: '5px',
};

const buttonDelete: React.CSSProperties = {
  backgroundColor: '#f44336',
  border: 'none',
  color: 'white',
  padding: '5px 10px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '15px',
  cursor: 'pointer',
  borderRadius: '5px',
  marginLeft: '7px',
};
