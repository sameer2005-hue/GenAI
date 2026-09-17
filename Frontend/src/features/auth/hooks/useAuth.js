import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, changePassword } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      const user = {
        ...data.user,
        role: data.user?.role || localStorage.getItem(`accountRole:${data.user?.id}`) || "student",
      };
      localStorage.setItem(`accountRole:${user.id}`, user.role);
      setUser(user);
      return { ...data, user };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password, role }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password, role });
      const user = { ...data.user, role: data.user?.role || role };
      localStorage.setItem(`accountRole:${user.id}`, user.role);
      setUser(user);
      return { ...data, user };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      if (user?.id) localStorage.removeItem(`accountRole:${user.id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    return changePassword({ currentPassword, newPassword });
  };

  return {
    user,
    loading,
    handleLogin,
    handleLogout,
    handleRegister,
    handleChangePassword,
  };
};
