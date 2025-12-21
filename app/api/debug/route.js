// app/api/debug/route.js
export async function GET() {
  return Response.json({
    nextauthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    timestamp: new Date().toISOString(),
  });
}
