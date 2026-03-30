import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;

        // If user needs to change password, redirect to /set-password
        // (unless already on /set-password or /login)
        if (token && (token as any).mustChangePassword) {
            if (pathname !== "/set-password" && pathname !== "/login") {
                return NextResponse.redirect(new URL("/set-password", req.url));
            }
        }

        // If user doesn't need to change password but is on /set-password, redirect to home
        if (token && !(token as any).mustChangePassword && pathname === "/set-password") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const pathname = req.nextUrl.pathname;

                // Public routes that don't require authentication
                const publicRoutes = ["/login", "/access", "/api/auth", "/admin/generate-magic-link"];
                const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

                if (isPublicRoute) {
                    return true; // Allow access to public routes
                }

                // All other routes require authentication
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
