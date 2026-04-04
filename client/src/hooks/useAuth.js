import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

const DEFAULT_ADMIN = {
  id: "admin-1001",
  email: "admin@samadhaan.com",
  password: "admin123",
  role: "admin",
  name: "Administrator",
};

export const useAuth = () => {
  const { userRole, setUserRole, currentUser, setCurrentUser } = useApp();
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [authReady, setAuthReady] = useState(false);
  const isAuthenticated = Boolean(currentUser);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("civicUsers") || "[]");
    const users = storedUsers.length ? storedUsers : [DEFAULT_ADMIN];
    localStorage.setItem("civicUsers", JSON.stringify(users));
    setRegisteredUsers(users);

    const storedUser = localStorage.getItem("civicUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setUserRole(user.role);
    }

    setAuthReady(true);
  }, []);

  const persistUsers = (users) => {
    setRegisteredUsers(users);
    localStorage.setItem("civicUsers", JSON.stringify(users));
  };

  const login = (identifier, password, role = "citizen") => {
    let user;

    if (role === "admin") {
      user = registeredUsers.find(
        (item) =>
          item.role === "admin" &&
          item.id.toString() === identifier.toString() &&
          item.password === password,
      );
      if (
        !user &&
        identifier === DEFAULT_ADMIN.id &&
        password === DEFAULT_ADMIN.password
      ) {
        user = DEFAULT_ADMIN;
      }
    } else {
      user = registeredUsers.find(
        (item) =>
          item.role === role &&
          item.email?.toLowerCase() === identifier.toLowerCase() &&
          item.password === password,
      );
    }

    if (!user) {
      return { error: "Invalid credentials. Please check your login details." };
    }

    localStorage.setItem("civicUser", JSON.stringify(user));
    setCurrentUser(user);
    setUserRole(user.role);
    return { user };
  };

  const logout = () => {
    localStorage.removeItem("civicUser");
    setCurrentUser(null);
    setUserRole("citizen");
  };

  const register = (userData) => {
    if (userData.role === "admin") {
      return { error: "Admin accounts cannot be created here." };
    }

    const normalizedEmail = userData.email?.trim().toLowerCase();
    if (!normalizedEmail || !userData.password) {
      return { error: "Email and password are required." };
    }

    const existingUser = registeredUsers.find(
      (item) => item.email?.toLowerCase() === normalizedEmail,
    );
    if (existingUser) {
      return { error: "A user with this email already exists." };
    }

    const user = {
      id: Date.now().toString(),
      email: normalizedEmail,
      password: userData.password,
      role: userData.role || "citizen",
      name: userData.name || normalizedEmail.split("@")[0],
    };

    const nextUsers = [user, ...registeredUsers];
    persistUsers(nextUsers);

    localStorage.setItem("civicUser", JSON.stringify(user));
    setCurrentUser(user);
    setUserRole(user.role);

    return { user };
  };

  return {
    isAuthenticated,
    authReady,
    user: currentUser,
    userRole,
    login,
    logout,
    register,
    registeredUsers,
  };
};
