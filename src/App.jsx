import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import RegisterForm from "./components/RegisterForm";
import LoginForm from './components/LoginForm';
import CreatePostForm from "./components/CreatePostForm";
import PostFeed from "./components/PostFeed";
import Layout from "./components/Layout";
import Profile from "./components/Profile";
import Users from "./components/Users";
import CategoryManager from "./components/CategoryManager";

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/" element={<Layout />} >
        <Route path="/posts" element={<PostFeed />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/post" element={<CreatePostForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/users" element={<Users/>} />
        <Route path="/category" element={<CategoryManager/>} />
      </Route>
    </Routes>
  );
}
