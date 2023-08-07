/** @format */

import { ActionArgs, LoaderArgs, redirect } from '@remix-run/node';
import { Link, Form, useActionData, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { storage } from '~/utils/session.server';
import type { V2_MetaFunction } from '@vercel/remix';

export const meta: V2_MetaFunction = () => [{ title: 'Update Profile' }];

export async function loader({ request }: LoaderArgs) {
  // Parse cookies from the request headers
  const session = await storage.getSession(request.headers.get('Cookie'));
  const getToken = session.get('token');

  // If the user is not logged in, redirect them to the login page
  if (!getToken) {
    return redirect('/login');
  }

  const decodedToken = decodeToken(getToken) as { role: string; id?: string } | null;

  const getUser = async () => {
    try {
      const res = await fetch(`https://mail.apisansco.my.id/api/v1/users/${decodedToken && decodedToken.id}`, {
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

  return { token: decodedToken, user: await getUser() };
}

export const action = async ({ request }: ActionArgs) => {
  // Get the form data from the request
  const body = await request.formData();

  if (body.get('name') === '' || body.get('phone_number') === '' || body.get('email') === '') {
    return { status: 'error', message: 'Form data is incomplete' };
  }

  const updateUser = async () => {
    try {
      const id = body.get('id')?.toString();
      const name = body.get('name')?.toString();
      const email = body.get('email')?.toString();
      const phone_number = body.get('phone_number')?.toString();
      const password = body.get('password')?.toString();

      // Create a data object containing only the non-empty values
      const data: { [key: string]: string } = {
        name: name || '',
        email: email || '',
        phone_number: phone_number || '',
      };

      // Add password to the data object only if it exists (not null or empty)
      if (password) {
        data.password = password;
      }

      const res = await fetch(`https://mail.apisansco.my.id/api/v1/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return res.json();
    } catch (error) {
      return { status: 'error', message: 'Failed to update profile' };
    }
  };

  // console.log('adasd', updateUser());

  return updateUser();
};

export default function UpdateProfile() {
  const result = useActionData<typeof action>();
  const loaderResult = useLoaderData();

  const sidebarOwner = (tokenData: any, form: any) => {
    return (
      <div style={styles.container}>
        <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap' />
        <link href='https://fonts.cdnfonts.com/css/helvetica-neue-5' rel='stylesheet' />
        <nav style={menu} tabIndex={0}>
          <header style={avatar}>
            <img
              src='https://d1fdloi71mui9q.cloudfront.net/S8ZFGu5CSESuNxb8PgVG_4I3acZO5E7rZ1AeJ'
              alt='User Avatar'
              style={styles.avatarImg}
            />
            <h3 style={{ color: 'white' }}>{tokenData.name}</h3>
          </header>
          <ul>
            <li tabIndex={0} style={styles.menuItemDashboard}>
              <Link style={styles.linkMenu} to='/'>
                Data User
              </Link>
            </li>
            <li tabIndex={0} style={styles.menuItemDashboard}>
              <Link style={styles.linkMenu} to='/owner/categories/'>
                Data Kategori Menu
              </Link>
            </li>
            <li tabIndex={0} style={styles.menuItemDashboard}>
              <Link style={styles.linkMenu} to='/owner/menus/'>
                Data Menu
              </Link>
            </li>
            <li tabIndex={0} style={styles.menuItemDashboard}>
              <Link style={styles.linkMenu} to='/owner/orders/'>
                Data Pesanan
              </Link>
            </li>
            <li tabIndex={0} style={styles.menuItemDashboard}>
              <Link style={styles.linkMenu} to='/owner/devices/'>
                Data Devices
              </Link>
            </li>
            <li tabIndex={0} style={styles.menuItemSettings}>
              <Link style={styles.linkMenu} to='/update-profile/'>
                Update Profile
              </Link>
            </li>
            <li tabIndex={0} style={styles.logoutItemSettings}>
              <form action='/logout' method='post'>
                <button type='submit' style={styles.buttonLogout}>
                  Logout
                </button>
              </form>
            </li>
          </ul>
        </nav>
        {form}
      </div>
    );
  };

  const sidebarKoki = (tokenData: any, form: any) => {
    return (
      <div style={styles.container}>
        <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap' />
        <link href='https://fonts.cdnfonts.com/css/helvetica-neue-5' rel='stylesheet' />
        <nav style={menu} tabIndex={0}>
          <header style={avatar}>
            <img
              src='https://d1fdloi71mui9q.cloudfront.net/S8ZFGu5CSESuNxb8PgVG_4I3acZO5E7rZ1AeJ'
              alt='User Avatar'
              style={styles.avatarImg}
            />
            <h3 style={{ color: 'white' }}>{tokenData.name}</h3>
          </header>
          <ul>
            <li tabIndex={0} style={styles.menuItemDashboard}>
              <Link style={styles.linkMenu} to='/'>
                Data Pesanan Sudah Dibayar
              </Link>
            </li>
            <li tabIndex={0} style={styles.menuItemCustomers}>
              <Link style={styles.linkMenu} to='/koki/list-processed-orders'>
                Data Pesanan Sedang Diproses
              </Link>
            </li>
            <li tabIndex={0} style={styles.menuItemUsers}>
              <Link style={styles.linkMenu} to='/koki/list-finished-orders'>
                Data Pesanan Selesai
              </Link>
            </li>
            <li tabIndex={0} style={styles.menuItemSettings}>
              <Link style={styles.linkMenu} to='/update-profile'>
                Update Profile
              </Link>
            </li>
            <li tabIndex={0} style={styles.logoutItemSettings}>
              <form action='/logout' method='post'>
                <button type='submit' style={styles.buttonLogout}>
                  Logout
                </button>
              </form>
            </li>
          </ul>
        </nav>
        {form}
      </div>
    );
  };

  const sidebarKasir = (tokenData: any, form: any) => {
    return (
      <div style={styles.container}>
        <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap' />
        <link href='https://fonts.cdnfonts.com/css/helvetica-neue-5' rel='stylesheet' />
        <nav style={menu} tabIndex={0}>
          <header style={avatar}>
            <img
              src='https://d1fdloi71mui9q.cloudfront.net/S8ZFGu5CSESuNxb8PgVG_4I3acZO5E7rZ1AeJ'
              alt='User Avatar'
              style={styles.avatarImg}
            />
            <h3 style={{ color: 'white' }}>{tokenData.name}</h3>
          </header>
          <ul>
            <li tabIndex={0} style={styles.menuItemDashboard}>
              <Link style={styles.linkMenu} to='/'>
                Data Pesanan
              </Link>
            </li>
            <li tabIndex={0} style={styles.menuItemSettings}>
              <Link style={styles.linkMenu} to='/update-profile'>
                Update Profile
              </Link>
            </li>
            <li tabIndex={0} style={styles.logoutItemSettings}>
              <form action='/logout' method='post'>
                <button type='submit' style={styles.buttonLogout}>
                  Logout
                </button>
              </form>
            </li>
          </ul>
        </nav>
        {form}
      </div>
    );
  };

  const form = () => {
    return (
      <div style={main}>
        <div style={helper}>
          <h2 style={heading}>Update Profile</h2>
        </div>
        {/* Form section */}
        <div style={formContainer}>
          <Form method='post' onSubmit={handleSubmit}>
            <input type='hidden' name='id' defaultValue={loaderResult.token.id} />
            <label style={formLabel} htmlFor='dataInput'>
              Nama:
            </label>
            <input style={formInput} type='text' id='dataInput' name='name' defaultValue={loaderResult.user.data.name} />
            <label style={formLabel} htmlFor='dataInput'>
              Nomor Handphone:
            </label>
            <input style={formInput} type='text' id='dataInput' name='phone_number' defaultValue={loaderResult.user.data.phone_number} />
            <label style={formLabel} htmlFor='dataInput'>
              Email:
            </label>
            <input style={formInput} type='email' id='dataInput' name='email' defaultValue={loaderResult.user.data.email} />
            <label style={formLabel} htmlFor='dataInput'>
              Password:
            </label>
            <input style={formInput} type='password' id='dataInput' name='password' />
            <button style={submitButton} type='submit'>
              Submit
            </button>
          </Form>
        </div>
        <ToastContainer />
      </div>
    );
  };
  // console.log(result);

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
      request: new Request(`/api/v1/users/${loaderResult.token.id}`, { method: 'PATCH', body: formData }),
      params: { id: loaderResult.token.id }, // Include the id in the params
      context: {}, // Add an empty context object
    });

    if (response && response.status === 'success') {
      notify('Data profile berhasil diupdate!', 'success');
      setTimeout(() => {
        window.location.href = '/update-profile/';
      }, 2500);
    } else {
      notify('Data profile gagal diupdate!', 'error');
      setTimeout(() => {
        window.location.href = '/update-profile/';
      }, 2500);
    }
  };

  return (
    <div>
      {loaderResult.token.role === 'OWNER'
        ? sidebarOwner(loaderResult.token, form())
        : loaderResult.token.role === 'KOKI'
        ? sidebarKoki(loaderResult.token, form())
        : sidebarKasir(loaderResult.token, form())}
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

const avatar: React.CSSProperties = {
  padding: '2em 0.5em',
  textAlign: 'center',
};

const menu: React.CSSProperties = {
  background: '#574d4f',
  width: '240px',
  padding: '2em 1em',
  outline: 'none',
};

const styles = {
  container: {
    fontFamily: 'Open Sans',
    display: 'flex',
  },
  avatarImg: {
    width: '100px',
    borderRadius: '50%',
    overflow: 'hidden',
    // border: '4px solid #ffea92',
    boxShadow: '0 0 0 4px rgba(59, 43, 51, 1)',
  },
  menuItemDashboard: {
    padding: '0.5em 0 0.5em 0.1em',
    fontSize: '0.95em',
    fontWeight: 'normal',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 15px center',
    color: '#fff',
    backgroundSize: 'auto 20px',
    transition: 'all 0.15s linear',
    cursor: 'pointer',
    listStyleType:'none',
  },
  menuItemCustomers: {
    padding: '0.5em 0 0.5em 0.1em',
    fontSize: '0.95em',
    fontWeight: 'normal',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 15px center',
    backgroundSize: 'auto 20px',
    transition: 'all 0.15s linear',
    color: '#fff',
    cursor: 'pointer',
    listStyleType:'none',
  },
  menuItemUsers: {
    padding: '0.5em 0 0.5em 0.1em',
    fontSize: '0.95em',
    fontWeight: 'normal',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 15px center',
    backgroundSize: 'auto 20px',
    transition: 'all 0.15s linear',
    color: '#fff',
    cursor: 'pointer',
    listStyleType:'none',
  },
  menuItemSettings: {
    padding: '0.5em 0 0.5em 0.1em',
    fontSize: '0.95em',
    fontWeight: 'normal',
    backgroundRepeat: 'no-repeat',
    color: '#fff',
    backgroundPosition: 'left 15px center',
    backgroundSize: 'auto 20px',
    transition: 'all 0.15s linear',
    cursor: 'pointer',
    listStyleType:'none',
  },
  logoutItemSettings: {
    padding: '0.5em 0 0.5em 0em',
    fontSize: '0.95em',
    fontWeight: 'normal',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 15px center',
    backgroundSize: 'auto 20px',
    transition: 'all 0.15s linear',
    cursor: 'pointer',
    marginLeft: '-0.1em',
    listStyleType:'none',
  },
  buttonLogout: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '0.95em',
    fontWeight: 'normal',
    cursor: 'pointer',
    outline: 'none',
  },
  linkMenu: {
    textDecoration: 'none',
    color: '#fff',
    fontSize: '0.95em',
  },
};
