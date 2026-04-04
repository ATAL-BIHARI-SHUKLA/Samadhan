import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft } from "lucide-react";

const Auth = () => {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("citizen");
  const [values, setValues] = useState({
    name: "",
    email: "",
    adminId: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (mode === "signup") {
      if (
        !values.name.trim() ||
        !values.email.trim() ||
        !values.password.trim() ||
        !values.confirmPassword.trim()
      ) {
        toast.error("Please fill in all fields.");
        return;
      }
      if (values.password !== values.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      const result = register({
        email: values.email.trim(),
        password: values.password.trim(),
        role,
        name: values.name.trim(),
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `Account created for ${values.name} (${values.email}). You are now logged in.`,
      );
      navigate("/");
      return;
    }

    if (mode === "login") {
      if (role === "admin") {
        if (!values.adminId.trim() || !values.password.trim()) {
          toast.error("Please enter your admin ID and password.");
          return;
        }
        const result = login(
          values.adminId.trim(),
          values.password.trim(),
          "admin",
        );
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Admin login successful.");
        navigate("/");
        return;
      }

      if (!values.email.trim() || !values.password.trim()) {
        toast.error("Please enter your Gmail and password.");
        return;
      }

      const result = login(values.email.trim(), values.password.trim(), role);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Login successful.");
      navigate("/");
    }
  };

  return (
    <main className="min-h-screen px-4 py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white shadow-xl rounded-3xl"
        >
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-700"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to home
          </Link>

          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === "login" ? "Welcome Back" : "Create Your Account"}
            </h1>
            <p className="max-w-xl mt-2 text-sm text-gray-500">
              {mode === "login"
                ? "Sign in with your Gmail and password, or use admin ID for admin access."
                : "Sign up as a citizen or worker to start reporting and tracking issues."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="p-5 border border-gray-100 bg-gray-50 rounded-3xl">
              <div className="grid gap-4 sm:grid-cols-2">
                {mode === "signup" ? (
                  <>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Account type
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="worker">Worker</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={values.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Gmail address
                      </label>
                      <input
                        type="email"
                        value={values.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        value={values.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                        placeholder="Enter password"
                        className="w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Confirm password
                      </label>
                      <input
                        type="password"
                        value={values.confirmPassword}
                        onChange={(e) =>
                          handleChange("confirmPassword", e.target.value)
                        }
                        placeholder="Repeat password"
                        className="w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Login type
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="worker">Worker</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    {role === "admin" ? (
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Admin ID
                        </label>
                        <input
                          type="text"
                          value={values.adminId}
                          onChange={(e) =>
                            handleChange("adminId", e.target.value)
                          }
                          placeholder="admin-1001"
                          className="w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Gmail address
                        </label>
                        <input
                          type="email"
                          value={values.email}
                          onChange={(e) =>
                            handleChange("email", e.target.value)
                          }
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        value={values.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                        placeholder="Enter password"
                        className="w-full px-4 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center w-full px-6 py-4 text-base font-semibold text-white transition-all duration-200 bg-primary-600 rounded-2xl hover:bg-primary-700"
            >
              {mode === "signup"
                ? "Create account"
                : role === "admin"
                  ? "Admin login"
                  : "Login with Gmail"}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-500">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setValues({
                      name: "",
                      email: "",
                      adminId: "",
                      password: "",
                      confirmPassword: "",
                    });
                    setRole("citizen");
                  }}
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                New to Samadhaan?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setValues({
                      name: "",
                      email: "",
                      adminId: "",
                      password: "",
                      confirmPassword: "",
                    });
                    setRole("citizen");
                  }}
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  Create an account
                </button>
              </>
            )}
          </div>

          <div className="p-6 mt-8 text-sm text-gray-600 bg-gray-100 rounded-3xl">
            {mode === "login" ? (
              <p>
                Citizens and workers login with Gmail and password. Admins login
                with ID and password.
              </p>
            ) : (
              <p>
                Citizens and workers must register first using their Gmail
                before they can login again.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Auth;
