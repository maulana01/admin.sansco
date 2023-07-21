/** @format */

import { ActionArgs, LoaderArgs, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

export const action = async ({ request }: ActionArgs) => {
  // Get the form data from the request
  const body = await request.formData();

  if (body.get('name') === '' || body.get('image') === '') {
    return { status: 'error', message: 'Form data is incomplete' };
  }

  const addCategory = async () => {
    try {
			const formData = new FormData();
			formData.append('name', body.get('name') as string);
      formData.append('image', body.get('image') as Blob);

      const res = await fetch('http://103.175.216.182:4000/api/v1/categories/', {
        method: 'POST',
        body: formData,
      });

      return res.json();
    } catch (error) {
      return { status: 'error', message: 'Gagal menambahkan Kategori Menu' };
    }
  };

  return addCategory();
};

export default function AddCategories() {
  const result = useActionData<typeof action>();
	const [previewImage, setPreviewImage] = useState<string | null>(null); // State to hold the preview image URL
  console.log(result);

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

    // If the form is valid, call the 'load' function (which will trigger the 'action' function)
    const response = await action({
      request: new Request('/', { method: 'POST', body: formData }),
      context: {},
      params: {},
    });

    if (response && response.status === 'success') {
      notify('Data Kategori Menu berhasil ditambahkan!', 'success');
      setTimeout(() => {
        window.location.href = '/owner/categories/';
      }, 2500);
    } else {
      notify('Data Kategori Menu gagal ditambahkan!', 'error');
      setTimeout(() => {
        window.location.href = '/owner/categories/add';
      }, 2500);
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
        <h2 style={heading}>Tambah Data Kategori Menu</h2>
      </div>
      {/* Form section */}
      <div style={formContainer}>
        <Form method='post' onSubmit={handleSubmit} encType='multipart/form-data'>
          <label style={formLabel} htmlFor='dataInput'>
            Nama:
          </label>
          <input style={formInput} type='text' id='dataInput' name='name' />
          <label style={formLabel} htmlFor='dataInput'>
            Gambar:
          </label>
					<input
            style={formInput}
            type='file'
            id='dataInput'
            name='image'
            onChange={handleFileSelect} // Add the event listener to the file input
          />
					{/* Show the preview image if available */}
          {previewImage && (
            <div style={{ marginTop: '1rem' }}>
              <img
                src={previewImage}
                alt='Preview'
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
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
