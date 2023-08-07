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
    <div style={container}>
      <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap' />
      <link href='https://fonts.cdnfonts.com/css/helvetica-neue-5' rel='stylesheet' />
      <nav style={menu} tabIndex={0}>
        <header style={avatar}>
          <img src='https://d1fdloi71mui9q.cloudfront.net/S8ZFGu5CSESuNxb8PgVG_4I3acZO5E7rZ1AeJ' alt='User Avatar' style={avatarImg} />
          <h3 style={{ color: 'white' }}>{tokenData.name}</h3>
        </header>
        <ul>
          <li tabIndex={0} style={menuItemDashboard}>
            <Link style={linkMenu} to='/'>
              Data User
            </Link>
          </li>
          <li tabIndex={0} style={menuItemDashboard}>
            <Link style={linkMenu} to='/owner/categories/'>
              Data Kategori Menu
            </Link>
          </li>
          <li tabIndex={0} style={menuItemDashboard}>
            <Link style={linkMenu} to='/owner/menus/'>
              Data Menu
            </Link>
          </li>
          <li tabIndex={0} style={menuItemDashboard}>
            <Link style={linkMenu} to='/owner/orders/'>
              Data Pesanan
            </Link>
          </li>
          <li tabIndex={0} style={menuItemDashboard}>
            <Link style={linkMenu} to='/owner/devices/'>
              Data Devices
            </Link>
          </li>
          <li tabIndex={0} style={menuItemSettings}>
            <Link style={linkMenu} to='/update-profile/'>
              Update Profile
            </Link>
          </li>
          <li tabIndex={0} style={logoutItemSettings}>
            <form action='/logout' method='post'>
              <button type='submit' style={buttonLogout}>
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

const container: React.CSSProperties = {
  margin: '0px',
  padding: '0px',
  boxSizing: 'border-box',
  fontFamily: 'Open Sans',
  display: 'flex',
};
const avatarImg: React.CSSProperties = {
  width: '100px',
  borderRadius: '50%',
  overflow: 'hidden',
  // border: '4px solid #ffea92',
  boxShadow: '0 0 0 4px rgba(59, 43, 51, 1)',
};
const menuItemDashboard: React.CSSProperties = {
  padding: '0.5em 0 0.5em 0.1em',
  fontSize: '0.95em',
  fontWeight: 'normal',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'left 15px center',
  color: '#fff',
  listStyleType:'none',
  backgroundSize: 'auto 20px',
  transition: 'all 0.15s linear',
  cursor: 'pointer',
};
const menuItemCustomers: React.CSSProperties = {
  padding: '0.5em 0 0.5em 1em',
  fontSize: '0.95em',
  fontWeight: 'normal',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'left 15px center',
  backgroundSize: 'auto 20px',
  transition: 'all 0.15s linear',
  color: '#fff',
  cursor: 'pointer',
};
const menuItemUsers: React.CSSProperties = {
  padding: '0.5em 0 0.5em 1em',
  fontSize: '0.95em',
  fontWeight: 'normal',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'left 15px center',
  backgroundSize: 'auto 20px',
  transition: 'all 0.15s linear',
  color: '#fff',
  cursor: 'pointer',
};
const menuItemSettings: React.CSSProperties = {
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
};
const logoutItemSettings: React.CSSProperties = {
  padding: '0.5em 0 0.5em 0',
  fontSize: '0.95em',
  fontWeight: 'normal',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'left 15px center',
  backgroundSize: 'auto 20px',
  transition: 'all 0.15s linear',
  cursor: 'pointer',
  marginLeft: '-0.1em',
  listStyleType:'none',
};
const buttonLogout: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#fff',
  fontSize: '0.95em',
  fontWeight: 'normal',
  cursor: 'pointer',
  outline: 'none',
};
const linkMenu: React.CSSProperties = {
  textDecoration: 'none',
  color: '#fff',
  fontSize: '0.95em',
};
const styles = {};
