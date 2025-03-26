import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: ""
  });

  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const accessToken = localStorage.getItem("rc_access_token");
      setStatus("Submitting...");

      await axios.post("http://localhost:8000/customers/signup", {
        ...formData,
        rc_token: accessToken
      });

      setStatus("Success! Redirecting...");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setStatus("Signup failed. Please try again.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Complete Your Signup</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <div className="mb-4">
          <label className="block font-semibold mb-1">Name</label>
          <input name="name" required onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Email</label>
          <input type="email" name="email" required onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Company</label>
          <input name="company" required onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md mt-2">
          Start My Trial
        </button>
        {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}
      </form>
    </main>
  );
}

