/** @format */

import type { V2_MetaFunction } from '@vercel/remix';
import { LoaderArgs, redirect } from '@remix-run/node';
import { decodeToken } from 'react-jwt';
import { storage } from '~/utils/session.server';
import React from 'react';

export const config = { runtime: 'edge' };

export const meta: V2_MetaFunction = () => [{ title: 'Home | Dashboard Owner' }];

export async function loader({ request }: LoaderArgs) {
  // Parse cookies from the request headers
  const session = await storage.getSession(request.headers.get('Cookie'));
  const getToken = session.get("token");

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

export default function home() {
  return (
    <div>
      <main style={styles.main}>
        <div style={helper}>
          RESIZE THE WINDOW
          <span style={styles.span}>Breakpoints on 900px and 400px</span>
        </div>
      </main>
    </div>
  );
}

const helper: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#333',
};
const styles = {
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: '100vh',
    background: '#f5f5f5',
    width: '80vw',
  },

  span: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 400,
    color: '#999',
  },
};
