/** @format */

import { ActionArgs, LoaderArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { storage } from '~/utils/session.server';

const ip = `http://103.175.216.182:4000`;

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

  const getUser = async () => {
    try {
      const res = await fetch(`${ip}/api/v1/users/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.json();
    } catch (error) {
      return { status: 'error', message: 'Failed to get user' };
    }
  };

  return getUser();
}

export const action = async ({ request, params }: ActionArgs) => {
  // Get the form data from the request
  const body = await request.formData();

  if (body.get('name') === '' || body.get('phone_number') === '' || body.get('email') === '') {
    return { status: 'error', message: 'Form data is incomplete' };
  }

  console.log('ini params', params.id);

  const updateUser = async () => {
    try {
      const res = await fetch(`${ip}/api/v1/users/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: body.get('name') != '' && body.get('name'),
          email: body.get('email') != '' && body.get('email'),
          phone_number: body.get('phone_number') != '' && body.get('phone_number'),
          role: body.get('role'),
        }),
      });
      return res.json();
    } catch (error) {
      return { status: 'error', message: 'Failed to edit user' };
    }
  };

  // console.log('adasd', updateUser());

  return updateUser();
};

export default function EditUsers() {
  const result = useActionData<typeof action>();
  const loaderResult = useLoaderData<typeof loader>();
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

    if (formData.get('name') === '' || formData.get('phone_number') === '' || formData.get('email') === '') {
      notify('Harap Lengkapi data!', 'error');
      return;
    }

    // If the form is valid, call the 'load' function (which will trigger the 'action' function)
    const response = await action({
      request: new Request(`/api/v1/users/${loaderResult.data.id}`, { method: 'PATCH', body: formData }),
      params: { id: loaderResult.data.id }, // Include the id in the params
      context: {}, // Add an empty context object
    });

    if (response && response.status === 'success') {
      notify('Data user berhasil diubah!', 'success');
      setTimeout(() => {
        window.location.href = '/owner/';
      }, 2500);
    } else {
      notify('Data user gagal diubah!', 'error');
      setTimeout(() => {
        window.location.href = `/owner/users/edit/${loaderResult.data.id}`;
      }, 2500);
    }
  };

  return (
    <div style={main}>
      <div style={helper}>
        <h2 style={heading}>Update Data User</h2>
      </div>
      {/* Form section */}
      <div style={formContainer}>
        <Form method='post' onSubmit={handleSubmit}>
          <label style={formLabel} htmlFor='dataInput'>
            Nama:
          </label>
          <input style={formInput} type='text' id='dataInput' name='name' defaultValue={loaderResult.data.name} />
          <label style={formLabel} htmlFor='dataInput'>
            Nomor Handphone:
          </label>
          <input style={formInput} type='text' id='dataInput' name='phone_number' defaultValue={loaderResult.data.phone_number} />
          <label style={formLabel} htmlFor='dataInput'>
            Email:
          </label>
          <input style={formInput} type='email' id='dataInput' name='email' defaultValue={loaderResult.data.email} />
          <label style={formLabel} htmlFor='dataInput'>
            Role:
          </label>
          <select style={selectInputStyle} id='selectInput' name='role' defaultValue={loaderResult.data.role}>
            <option value='OWNER'>Owner</option>
            <option value='KOKI'>Koki</option>
            <option value='KASIR'>Kasir</option>
          </select>
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