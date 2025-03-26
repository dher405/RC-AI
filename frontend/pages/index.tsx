import React from "react";

export default function HomePage() {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_RINGCENTRAL_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_RINGCENTRAL_REDIRECT_URI || "");
    const authUrl = `https://platform.ringcentral.com/restapi/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=signup`;

    window.location.href = authUrl;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to AI-RC</h1>
      <p className="mb-6 max-w-xl text-gray-600">
        Connect your RingCentral account to start managing your phone system using AI.
        You'll get a 2-week free trial to explore features.
      </p>
      <button
        onClick={handleConnect}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg transition-all shadow-md"
      >
        Connect RingCentral Account
      </button>
    </main>
  );
}

