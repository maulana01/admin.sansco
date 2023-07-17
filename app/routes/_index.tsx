import type { V2_MetaFunction } from "@vercel/remix";
import { LoaderArgs, redirect } from '@remix-run/node';
import { Outlet} from '@remix-run/react';

export const meta: V2_MetaFunction = () => [{ title: "New Remix App" }];

export async function loader({ request }: LoaderArgs) {
  return redirect('/login')
}

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
      <Outlet/>
    </div>
  );
}
