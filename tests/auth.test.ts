import assert from "node:assert/strict";
import test from "node:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadAuthModule } from "./helpers/auth-module";
import { safeAuthNext } from "../lib/auth/redirects";

const idle = { status: "idle" };

async function loadActions(
  headerValues: Record<string, string> = {},
  authOverrides: Record<string, unknown> = {},
) {
  let signup: { options: { emailRedirectTo: string } } | undefined;
  const actions = await loadAuthModule("lib/actions/auth.ts", {
    "@/lib/auth/redirects": { safeAuthNext },
    "next/headers": {
      headers: async () => new Headers(headerValues),
    },
    "next/navigation": {
      redirect: (path: string) => {
        throw new Error(`redirect:${path}`);
      },
    },
    "@/lib/supabase/server": {
      createClient: async () => ({
        auth: {
          signUp: async (input: typeof signup) => {
            signup = input;
            return { data: { session: null }, error: null };
          },
          ...authOverrides,
        },
      }),
    },
  });
  return { actions, signup: () => signup };
}

function signupForm(next = "/") {
  const form = new FormData();
  form.set("email", "driver@example.com");
  form.set("password", "valid-password");
  form.set("next", next);
  return form;
}

test("signup confirmation keeps the deployed origin and requested internal destination", async () => {
  const { actions, signup } = await loadActions({
    origin: "https://vroom-view.vercel.app",
  });
  await actions.signUpAction(idle as never, signupForm("/submit") as never);
  assert.equal(
    signup()?.options.emailRedirectTo,
    "https://vroom-view.vercel.app/auth/callback?next=%2Fsubmit",
  );
});

test("signup on localhost without an Origin header uses its HTTP origin", async () => {
  const { actions, signup } = await loadActions({ host: "localhost:3000" });
  await actions.signUpAction(idle as never, signupForm() as never);
  assert.equal(
    signup()?.options.emailRedirectTo,
    "http://localhost:3000/auth/callback?next=%2F",
  );
});

test("signup rejects browser-normalized external destinations", async () => {
  for (const next of [
    "//evil.example",
    "/\\evil.example",
    "/\n/evil.example",
  ]) {
    const { actions, signup } = await loadActions({
      origin: "https://vroom-view.vercel.app",
    });
    await actions.signUpAction(idle as never, signupForm(next) as never);
    assert.equal(
      signup()?.options.emailRedirectTo,
      "https://vroom-view.vercel.app/auth/callback?next=%2F",
    );
  }
});

test("email is the saved login credential and the public handle is not", async () => {
  const fields = await loadAuthModule("components/auth/fields.tsx");
  const email = renderToStaticMarkup(
    createElement(fields.EmailField as ComponentType),
  );
  const handle = renderToStaticMarkup(
    createElement(fields.UsernameField as ComponentType),
  );
  assert.match(email, /type="email"/);
  assert.match(email, /autoComplete="username"/);
  assert.doesNotMatch(handle, /autoComplete="username"/);
});

test("unconfirmed email credentials stay on the sign-in form with confirmation instructions", async () => {
  const { actions } = await loadActions(
    {},
    {
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { code: "email_not_confirmed" },
      }),
    },
  );
  const state = (await actions.signInAction(
    idle as never,
    signupForm() as never,
  )) as { status: string; message: string };
  assert.equal(state.status, "error");
  assert.match(state.message, /Confirm your email/);
});

for (const route of ["callback", "confirm"]) {
  test(`${route} email landing stays on the app for a backslash redirect`, async () => {
    const auth = {
      exchangeCodeForSession: async () => ({ error: null }),
      verifyOtp: async () => ({ error: null }),
    };
    const routeModule = await loadAuthModule(`app/auth/${route}/route.ts`, {
      "@/lib/auth/redirects": { safeAuthNext },
      "@/lib/supabase/server": { createClient: async () => ({ auth }) },
      "next/server": {
        NextResponse: { redirect: (url: URL) => Response.redirect(url) },
      },
    });
    const params = new URLSearchParams({
      next: "/\\evil.example",
      code: "confirmation-code",
      token_hash: "confirmation-hash",
      type: "email",
    });
    const response = (await routeModule.GET(
      new Request(
        `https://vroom-view.vercel.app/auth/${route}?${params}`,
      ) as never,
    )) as Response;
    assert.equal(
      response.headers.get("location"),
      "https://vroom-view.vercel.app/",
    );
  });
}
