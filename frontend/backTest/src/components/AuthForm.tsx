import React from "react";

interface Props {
  mode: "login" | "signup";
  form: { username: string; password: string };
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AuthForm: React.FC<Props> = ({ mode, form, error, onChange, onSubmit }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold mb-2">{mode === "login" ? "Login" : "Sign Up"}</h2>
    <form onSubmit={onSubmit} className="space-y-2">
      <input
        className="border p-2 w-full"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={onChange}
        autoComplete="username"
      />
      <input
        className="border p-2 w-full"
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={onChange}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
        {mode === "login" ? "Login" : "Sign Up"}
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  </div>
);

export default AuthForm;
