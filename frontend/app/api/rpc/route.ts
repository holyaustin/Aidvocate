// frontend/app/api/rpc/route.ts
import { NextRequest, NextResponse } from 'next/server';

const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://rpc-bradbury.genlayer.com';

export async function POST(request: NextRequest) {
  console.log('🔄 [API Proxy] Proxying request to GenLayer RPC...');
  console.log('   Target URL:', RPC_URL);
  
  try {
    const body = await request.json();
    console.log('   Method:', body.method);
    
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    console.log('   Response status:', response.status);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'RPC request failed' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}