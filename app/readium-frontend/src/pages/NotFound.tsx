import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { createLogger } from "@/lib/logger.ts";

const logger = createLogger('router');

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.warn('404 route', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-2 text-5xl font-bold tracking-tight text-foreground">404</h1>
        <p className="mb-6 text-sm text-muted-foreground">A rota acessada nao existe ou foi movida.</p>
        <a href="/" className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
          Voltar para biblioteca
        </a>
      </div>
    </div>
  );
};

export default NotFound;
