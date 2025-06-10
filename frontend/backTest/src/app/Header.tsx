import React from "react";

interface HeaderProps {
  isLoggedIn: boolean;
  user?: { username: string };
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isLoggedIn,
  user,
  onLogin,
  onSignup,
  onLogout,
}) => {
  return (
    <header className="flex justify-between items-center py-4 mb-6 border-b">
      <div className="text-xl font-bold">Task App</div>
      <nav className="space-x-4">
        {!isLoggedIn ? (
          <>
            <button className="text-blue-600 hover:underline" onClick={onLogin}>
              Login
            </button>
            <button
              className="text-green-600 hover:underline"
              onClick={onSignup}
            >
              Signup
            </button>
          </>
        ) : (
          <>
            <span className="text-gray-700 mr-2">{user?.username}</span>
            <button className="text-red-600 hover:underline" onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
