/** @format */

import { ActionArgs, LoaderArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import React, { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { storage } from '~/utils/session.server';
import type { V2_MetaFunction } from '@vercel/remix';

export const meta: V2_MetaFunction = () => [{ title: 'Update Kategori Menu | Dashboard Owner' }];

export async function loader({ request, params }: LoaderArgs) {
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

  const getCategory = async () => {
    try {
      const res = await fetch(`https://mail.apisansco.my.id/api/v1/categories/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.json();
    } catch (error) {
      return { status: 'error', message: 'Failed to get Category' };
    }
  };

  return getCategory();
}

export default function EditCategories() {
  const loaderResult = useLoaderData<typeof loader>();
  const [previewImage, setPreviewImage] = useState<string | null>(null); // State to hold the preview image URL

  const notify = (data: string, type: 'success' | 'error' | 'warning' | 'info') => {
    toast[type](data, {
      autoClose: 2000,
      position: toast.POSITION.TOP_RIGHT,
      toastId: 'alertToast',
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get('name') === '' || formData.get('image') === '') {
      notify('Harap Lengkapi data!', 'error');
      return;
    }

    try {
      // Make a PATCH request using fetch API
      const response = await fetch(`https://mail.apisansco.my.id/api/v1/categories/${loaderResult.data.id}`, {
        method: 'PATCH',
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        notify('Data Kategori Menu berhasil diubah!', 'success');
        setTimeout(() => {
          window.location.href = '/owner/categories/';
        }, 2500);
      } else {
        notify('Data Kategori Menu gagal diubah!', 'error');
        setTimeout(() => {
          window.location.href = `/owner/categories/edit/${loaderResult.data.id}`;
        }, 2500);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      notify('Terjadi kesalahan saat mengubah data Kategori Menu!', 'error');
    }
  };

  // Event listener to handle file selection and generate the preview image URL
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={main}>
      <div style={helper}>
        <h2 style={heading}>Update Data Category</h2>
      </div>
      {/* Form section */}
      <div style={formContainer}>
        <Form method='post' onSubmit={handleSubmit} encType='multipart/form-data'>
          <label style={formLabel} htmlFor='dataInput'>
            Nama:
          </label>
          <input style={formInput} type='text' id='dataInput' name='name' defaultValue={loaderResult.data.name} />
          <label style={formLabel} htmlFor='dataInput'>
            Gambar:
          </label>
          <input
            style={formInput}
            type='file'
            id='dataInput'
            name='image'
            onChange={handleFileSelect} // Add the event listener to the file input
            defaultValue={loaderResult.data.image}
          />
          {/* Show the preview image if available */}
          {previewImage ? (
            <div style={{ marginTop: '1rem' }}>
              <img src={previewImage} alt='Preview' style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <img src={loaderResult.data.image} alt='Preview' style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
            </div>
          )}
          <button style={submitButton} type='submit'>
            Submit
          </button>
        </Form>
      </div>
      <ToastContainer />
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
  width: '95%', // Change the width as needed
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

const selectInputStyle: React.CSSProperties = {
  width: '95%',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '0.9rem',
  fontWeight: 400,
  color: '#333',
  marginBottom: '1rem',
  boxSizing: 'border-box',
  backgroundColor: '#fff', // Set the background color for select input
};
