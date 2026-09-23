import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 });
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 1. Fetch persistent workspace from NestJS backend
  try {
    const wsRes = await fetch(`${API_URL}/skillos/workspace`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (wsRes.ok) {
      const data = await wsRes.json();
      return NextResponse.json(data, { status: 200 });
    } else if (wsRes.status === 401 || wsRes.status === 403) {
      return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 });
    } else if (wsRes.status === 404) {
      return NextResponse.json({ success: false, message: 'Workspace not found', workspace: null }, { status: 404 });
    } else if (wsRes.status >= 500) {
      return NextResponse.json({ success: false, message: 'Upstream workspace service error' }, { status: wsRes.status });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to retrieve workspace' }, { status: wsRes.status });
    }
  } catch {
    return NextResponse.json({ success: false, message: 'Upstream workspace service unavailable' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 });
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${API_URL}/skillos/provision`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }

    const errData = await res.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, message: errData.message || 'Provisioning failed' },
      { status: res.status },
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Provisioning service unavailable' }, { status: 503 });
  }
}
