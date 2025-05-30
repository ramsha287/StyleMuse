import { useEffect, useState } from "react";

export const useAuth = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return { role };
};
