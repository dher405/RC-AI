import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function OAuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Exchanging authorization code...");

  useEffect(() => {
    const exchangeToken = async () => {
      const { code } = router.query;

      if (!code) return;

      try {
        const response = await axios.post("http://localhost:8000/auth/token", {
          code,
          redirect_uri: process.env.NEXT_PUBLIC_RINGCENTRAL_REDIRECT_URI,
        });

        // Store tokens or session info (you’ll probably want a real auth layer later)
        localStorage.setItem("rc_access_token", response.data.access_token);

        setStatus("Redirecting to signup...");
        router.push("/signup");
      } catch (err) {
        console.error(err);
        setStatus("Failed to connect. Please try again.");
      }
    };

    if (router.isReady) {
      exchangeToken();
    }
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">AI-RC</h1>
      <p className="text-gray-600">{status}</p>
    </main>
  );
}

