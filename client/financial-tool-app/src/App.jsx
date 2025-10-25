import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import MainLayout from "./components/MainLayout.jsx";
import Navbar from "./components/Navbar.jsx";

function App() {

  return (
    <>
        <RouterProvider router={router} />
    </>
  )
}


const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '', element: <Navbar /> },
    ],
  },
])

export default App
