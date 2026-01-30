export async function GET() {
    return Response.json({ message: "Server is up", status: "OK", uptime: process.uptime() });
}