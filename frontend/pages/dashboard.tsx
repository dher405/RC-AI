import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import CallFlowDiagram from "../components/CallFlowDiagram";
import AIChat from "../components/AIChat";


export default function DashboardPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "allowed" | "blocked">("loading");
  const [state, setState] = useState<string>("");

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem("rc_access_token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/customers/status", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const lifecycleState = res.data.state;
        setState(lifecycleState);

        if (["TRIAL", "ACTIVE"].includes(lifecycleState)) {
          setStatus("allowed");
        } else {
          setStatus("blocked");
        }
      } catch (err) {
        console.error(err);
        setStatus("blocked");
      }
    };

    checkStatus();
  }, [router]);

  if (status === "loading") {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p>Checking billing status...</p>
      </main>
    );
  }

  if (status === "blocked") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h1>
        <p className="text-gray-700 mb-2">Your account is currently in <strong>{state}</strong> status.</p>
        <p>Please update your billing to restore full access.</p>
      </main>
    );
  }

  return (
  <main className="flex flex-col items-center justify-start min-h-screen p-8">
    <h1 className="text-3xl font-bold mb-6">Welcome to your AI-RC Dashboard</h1>

    <div className="w-full max-w-xl mb-6 p-4 bg-white rounded shadow">
      <p className="text-gray-800 font-semibold">Current Status: {state}</p>
    </div>

    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CallFlowDiagram />
      <AIChat />
    </div>
  </main>
  );
}

