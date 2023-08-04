/** @format */

import type { V2_MetaFunction } from '@vercel/remix';
import { LoaderArgs, redirect } from '@remix-run/node';
import { decodeToken } from 'react-jwt';
import { storage } from '~/utils/session.server';
import React, { useState } from 'react';
import { Form, useLoaderData } from '@remix-run/react';
import { ToastContainer, toast } from 'react-toastify';

// export const config = { runtime: 'edge' };

export const meta: V2_MetaFunction = () => [{ title: 'Daftar Devices | Dashboard Owner' }];

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

  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const searchQuery = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10); // Get the page number from the query parameter
  const limit = 7;

  const fetchDevices = async () => {
    try {
      const queryString = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: String(searchQuery),
      }).toString();
      const response = await fetch(`https://mail.apisansco.my.id/api/v1/devices/?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      // console.log('Data fetched:', data);
      return data;
    } catch (error) {
      console.log('Error:', error);
    }
  };

  return await fetchDevices();
}

export async function action({ request }: LoaderArgs) {
  // Get the form data from the request
  const body = await request.formData();

  const deleteDevice = async () => {
    try {
      const res = await fetch(`https://mail.apisansco.my.id/api/v1/devices/${body.get('id')}`, {
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

  const response = await deleteDevice();

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
        <p style={modalText}>Apakah Anda yakin ingin menghapus data device?</p>
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

export default function Devices() {
  const devices = useLoaderData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deviceIdToDelete, setDeviceIdToDelete] = useState<string | null>(null);

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
    if (!deviceIdToDelete) {
      return;
    }

    const formData = new FormData();
    formData.append('id', deviceIdToDelete);

    const response = await action({
      request: new Request('/', { method: 'POST', body: formData }),
      context: {},
      params: {},
    });

    if (response && response.status === 'success') {
      notify('Data device berhasil dihapus!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } else {
      notify('Data device gagal dihapus!', 'error');
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }

    // Close the modal after the deletion process
    closeModal();
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryString = new URLSearchParams({
      page: '1', // Reset page to 1 on search
      search: searchQuery,
    }).toString();

    // Redirect to the URL with the new queryString
    window.location.href = `/owner/devices/?${queryString}`;
  };

  const handlePaginationClick = (page: number) => {
    // Parse the existing query string from the URL
    const currentSearchParams = new URLSearchParams(window.location.search);

    // Update the 'page' parameter in the existing query string
    currentSearchParams.set('page', String(page));

    // Get the updated query string
    const updatedQueryString = currentSearchParams.toString();

    // Redirect to the URL with the updated query string
    window.location.href = `/owner/devices/?${updatedQueryString}`;
  };

  return (
    <div style={main}>
      <link href='https://cdn.jsdelivr.net/npm/remixicon@3.2.0/fonts/remixicon.css' rel='stylesheet' />
      <div style={helper}>
        <h2 style={heading}>Daftar Data Devices</h2>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <form onSubmit={handleSearch}>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...searchInput }}
            placeholder='Search by Device Name'
          />
          <button type='submit' style={searchButton}>
            Search
          </button>
        </form>
      </div>
      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Device Id</th>
              <th style={th}>Device Brand</th>
              <th style={th}>Device Name</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {devices.data.rows.map((data: any) => (
              <tr key={data.id}>
                <td style={td}>{data.device_id}</td>
                <td style={td}>{data.device_brand}</td>
                <td style={td}>{data.device_name}</td>
                <td style={td}>
                  {/* Pass the user ID to setDeviceIdToDelete */}
                  <button
                    style={buttonDelete}
                    onClick={() => {
                      setDeviceIdToDelete(data.id);
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
          <span
            style={{
              ...paginationItem,
              cursor: devices.current_page == 1 ? 'not-allowed' : 'pointer',
              pointerEvents: devices.current_page == 1 ? 'none' : 'auto',
            }}
            onClick={() => handlePaginationClick(Number(devices.current_page) - 1)} // Go to the previous page
          >
            <i className='ri-arrow-left-line'></i>
          </span>
          <div style={{ margin: '0 0.5rem' }}>
            Page {devices.current_page} of {devices.total_pages}
          </div>
          <span
            style={{
              ...paginationItem,
              cursor: devices.current_page == devices.total_pages ? 'not-allowed' : 'pointer',
              pointerEvents: devices.current_page == devices.total_pages ? 'none' : 'auto',
            }}
            onClick={() => handlePaginationClick(Number(devices.current_page) + 1)} // Go to the next page
          >
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
};

const searchInput: React.CSSProperties = {
  padding: '10px',
  fontSize: '1rem',
  borderRadius: '5px 0 0 5px',
  border: '1px solid #ccc',
};

const searchButton: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '1rem',
  backgroundColor: '#4CAF50',
  color: 'white',
  margin: 0,
  border: 'none',
  borderRadius: '0 5px 5px 0',
  cursor: 'pointer',
};
