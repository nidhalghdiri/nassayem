// app/api/debug/route.js
export async function GET() {
  return Response.json({
    nextauthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    secret: process.env.NEXTAUTH_SECRET,
    db_url: process.env.DATABASE_URL,
    timestamp: new Date().toISOString(),
  });
}
