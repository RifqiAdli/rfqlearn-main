import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center card-brutal bg-white p-8">
        <h1 className="heading-brutal text-7xl">404</h1>
        <h2 className="mt-2 heading-brutal text-2xl">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm">Halaman yang kamu cari tidak ada.</p>
        <div className="mt-6">
          <Link to="/" className="btn-brutal no-underline">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center card-brutal bg-white p-8">
        <h1 className="heading-brutal text-2xl">Halaman gagal dimuat</h1>
        <p className="mt-2 text-sm">Terjadi kesalahan. Coba muat ulang.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-brutal"
          >
            Coba lagi
          </button>
          <a href="/" className="btn-brutal btn-brutal-ghost no-underline">
            Beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "rfqlearn — Belajar. Latihan. Lulus." },
      { name: "description", content: "Platform belajar bertenaga AI dengan soal latihan, feedback, dan sertifikat." },
      { name: "author", content: "rfqlearn" },
      { property: "og:title", content: "rfqlearn — Belajar. Latihan. Lulus." },
      { property: "og:description", content: "Platform belajar bertenaga AI dengan soal latihan, feedback, dan sertifikat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "rfqlearn — Belajar. Latihan. Lulus." },
      { name: "twitter:description", content: "Platform belajar bertenaga AI dengan soal latihan, feedback, dan sertifikat." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/818fa05b-896a-42bc-9530-f04c2e5c9c30/id-preview-9ddd7a23--21ec6fd7-0318-419c-8a5c-4d180e1f865d.lovable.app-1780385520036.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/818fa05b-896a-42bc-9530-f04c2e5c9c30/id-preview-9ddd7a23--21ec6fd7-0318-419c-8a5c-4d180e1f865d.lovable.app-1780385520036.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Navbar />
        <main className="min-h-[calc(100vh-66px)]">
          <Outlet />
        </main>
      </AppProvider>
    </QueryClientProvider>
  );
}
