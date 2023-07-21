/** @format */

import { LoaderArgs } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import React from 'react';
import { decodeToken } from 'react-jwt';
import { ToastContainer } from 'react-toastify';
import { storage } from '~/utils/session.server';

export async function loader({ request }: LoaderArgs) {
  const session = await storage.getSession(request.headers.get('Cookie'));
  const getToken = session.get('token');

  const decodedToken = decodeToken(getToken) as { role: string } | null;

  return decodedToken;
}

export default function Owner() {
  const tokenData = useLoaderData();
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
        <h3 style={{ color:'white' }}>{tokenData.name}</h3>
      </header>
      <ul>
        <li tabIndex={0} style={styles.menuItemDashboard}>
          <Link style={styles.linkMenu} to="/">Data User</Link>
        </li>
        <li tabIndex={0} style={styles.menuItemDashboard}>
          <Link style={styles.linkMenu} to="/owner/categories/">Data Kategori Menu</Link>
        </li>
        <li tabIndex={0} style={styles.menuItemDashboard}>
          <Link style={styles.linkMenu} to="/owner/menus/">Data Menu</Link>
        </li>
        <li tabIndex={0} style={styles.menuItemDashboard}>
          <Link style={styles.linkMenu} to="/owner/orders/">Data Pesanan</Link>
        </li>
        <li tabIndex={0} style={styles.menuItemDashboard}>
          <Link style={styles.linkMenu} to="/owner/devices/">Data Devices</Link>
        </li>
        <li tabIndex={0} style={styles.menuItemSettings}>
          <Link style={styles.linkMenu} to="/update-profile">Update Profile</Link>
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
    <Outlet />
  </div>
  );
}

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
    padding: '0.5em 0 0.5em 1em',
    fontSize: '0.95em',
    fontWeight: 'normal',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 15px center',
    color: '#fff',
    backgroundSize: 'auto 20px',
    transition: 'all 0.15s linear',
    cursor: 'pointer',
  },
  menuItemCustomers: {
    padding: '0.5em 0 0.5em 1em',
    fontSize: '0.95em',
    fontWeight: 'normal',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 15px center',
    backgroundSize: 'auto 20px',
    transition: 'all 0.15s linear',
    color: '#fff',
    cursor: 'pointer',
  },
  menuItemUsers: {
    padding: '0.5em 0 0.5em 1em',
    fontSize: '0.95em',
    fontWeight: 'normal',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 15px center',
    backgroundSize: 'auto 20px',
    transition: 'all 0.15s linear',
    color: '#fff',
    cursor: 'pointer',
  },
  menuItemSettings: {
    padding: '0.5em 0 0.5em 1em',
    fontSize: '0.95em',
    fontWeight: 'normal',
    backgroundRepeat: 'no-repeat',
    color: '#fff',
    backgroundPosition: 'left 15px center',
    backgroundSize: 'auto 20px',
    transition: 'all 0.15s linear',
    cursor: 'pointer',
  },
  logoutItemSettings: {
    padding: '0.5em 0 0.5em 0.6em',
    fontSize: '0.95em',
    fontWeight: 'normal',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 15px center',
    backgroundSize: 'auto 20px',
    transition: 'all 0.15s linear',
    cursor: 'pointer',
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
  }
};
