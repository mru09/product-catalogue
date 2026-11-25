import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { login } from "../services/api";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/layout/Header";
import type { User } from "../types";
import LoginPage from "./LoginPage";

jest.mock("../services/api", () => ({
  login: jest.fn(),
}));

const user: User = {
  id: "user-1",
  name: "Alex",
  email: "alex@example.com",
};
const token = "test-token";
const loginMock = jest.mocked(login);

function renderAuthApp(initialEntries = ["/login"]) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<p>Home page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

function emailInput() {
  return screen.getByRole("textbox");
}

function passwordInput() {
  return document.querySelector<HTMLInputElement>('input[type="password"]')!;
}

beforeEach(() => {
  localStorage.clear();
  loginMock.mockReset();
  loginMock.mockResolvedValue({ token, user });
});

it("logs in with valid credentials, stores the session, and navigates home", async () => {
  const userEvents = userEvent.setup();
  renderAuthApp();

  await userEvents.clear(emailInput());
  await userEvents.type(emailInput(), "alex@example.com");
  await userEvents.clear(passwordInput());
  await userEvents.type(passwordInput(), "correct-password");
  await userEvents.click(screen.getByRole("button", { name: "Log in" }));

  expect(loginMock).toHaveBeenCalledWith(
    "alex@example.com",
    "correct-password",
  );
  expect(await screen.findByText("Home page")).toBeInTheDocument();
  expect(screen.getByText("Hi, Alex")).toBeInTheDocument();
  expect(localStorage.getItem("token")).toBe(token);
  expect(JSON.parse(localStorage.getItem("user")!)).toEqual(user);
});

it("displays invalid-credential errors without storing a session", async () => {
  const userEvents = userEvent.setup();
  loginMock.mockRejectedValue(new Error("Invalid credentials"));
  renderAuthApp();

  await userEvents.click(screen.getByRole("button", { name: "Log in" }));

  expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  expect(screen.queryByText("Home page")).not.toBeInTheDocument();
  expect(localStorage.getItem("token")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
});

it("prevents submission when required fields are empty", async () => {
  const userEvents = userEvent.setup();
  renderAuthApp();

  await userEvents.clear(emailInput());
  await userEvents.clear(passwordInput());
  await userEvents.click(screen.getByRole("button", { name: "Log in" }));

  expect(loginMock).not.toHaveBeenCalled();
  expect(emailInput()).toBeInvalid();
  expect(passwordInput()).toBeInvalid();
  expect(localStorage.getItem("token")).toBeNull();
});

it("prevents submission for an invalid email address", async () => {
  const userEvents = userEvent.setup();
  renderAuthApp();

  await userEvents.clear(emailInput());
  await userEvents.type(emailInput(), "invalid-email");
  await userEvents.click(screen.getByRole("button", { name: "Log in" }));

  expect(loginMock).not.toHaveBeenCalled();
  expect(screen.getByDisplayValue("invalid-email")).toBeInvalid();
  expect(localStorage.getItem("token")).toBeNull();
});

it("restores the authenticated user after the app is remounted", async () => {
  const userEvents = userEvent.setup();
  const app = renderAuthApp();

  await userEvents.clear(emailInput());
  await userEvents.type(emailInput(), "alex@example.com");
  await userEvents.clear(passwordInput());
  await userEvents.type(passwordInput(), "correct-password");
  await userEvents.click(screen.getByRole("button", { name: "Log in" }));
  await screen.findByText("Hi, Alex");

  app.unmount();
  renderAuthApp(["/"]);

  expect(screen.getByText("Hi, Alex")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
});

it("treats a corrupted stored user as logged out", () => {
  localStorage.setItem("user", "{invalid json");

  renderAuthApp(["/"]);

  expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  expect(screen.queryByText("Hi, Alex")).not.toBeInTheDocument();
});

it("clears the session and shows logged-out navigation on logout", async () => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  const userEvents = userEvent.setup();
  renderAuthApp(["/"]);

  await userEvents.click(screen.getByRole("button", { name: "Logout" }));

  expect(localStorage.getItem("token")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
  expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  expect(screen.queryByText("Hi, Alex")).not.toBeInTheDocument();
});

it("shows login API failures without navigating", async () => {
  const userEvents = userEvent.setup();
  loginMock.mockRejectedValue(new Error("Server unavailable"));
  renderAuthApp();

  await userEvents.click(screen.getByRole("button", { name: "Log in" }));

  expect(await screen.findByText("Server unavailable")).toBeInTheDocument();
  expect(screen.queryByText("Home page")).not.toBeInTheDocument();
  expect(localStorage.getItem("token")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
});
