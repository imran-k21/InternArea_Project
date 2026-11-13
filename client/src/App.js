import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Home/Home';
import Footer from './Components/Footer/Footer';
import Intern from './Components/Internships/Intern';
import JobAvl from './Components/Job/JobAvl';
import JobDetail from './Components/Job/JobDetail';
import InternDetail from "./Components/Internships/InternDetail"
import Register from "./Components/auth/Register"
import { Route,Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login,logout}  from './Feature/Userslice';
import { auth } from "./firebase/firebase";
import Profile from './profile/Profile';
import AdminLogin from './Admin/AdminLogin';
import Adminpanel from './Admin/Adminpanel';
import Postinternships from './Admin/Postinternships';
import PostJob from './Admin/PostJob';
import ViewAllApplication from './Admin/ViewAllApplication';
import DetailApplication from './Application/DetailApplication';
import UserApplication from './profile/UserApplication';
import DetailApplicationUser from './Application/DetailApplicationUser';
import AdminRoute from './Admin/AdminRoute';
function App() {
  const dispatch=useDispatch();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser)=>{
      if(authUser){
        const providerInfo = authUser.providerData?.[0] || {};
        dispatch(login({
  
          uid:authUser.uid,
          photo:authUser.photoURL || providerInfo.photoURL || "",
          name:authUser.displayName || providerInfo.displayName || "User",
          email:authUser.email || providerInfo.email || "",
          phoneNumber:authUser.phoneNumber
        }))
      }
        else{
          dispatch(logout())
        }
    });
    return unsubscribe;
  }, [dispatch]);
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/internships' element={<Intern />} />
        <Route path='/jobs' element={<JobAvl />} />
        <Route path='/job_detail' element={<JobDetail />}/>
        <Route path='/intern_detail' element={<InternDetail />}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/adminLogin' element={<AdminLogin />}/>
        <Route path='/adminpanel' element={<AdminRoute><Adminpanel /></AdminRoute>}/>
        <Route path='/postInternship' element={<AdminRoute><Postinternships /></AdminRoute>}/>
        <Route path='/postJob' element={<AdminRoute><PostJob /></AdminRoute>} />
        <Route path='/applications' element={<AdminRoute><ViewAllApplication /></AdminRoute>}/>
        <Route path='/detailApplication' element={<AdminRoute><DetailApplication /></AdminRoute>}/>
        <Route  path='/userapplicationDetail' element={<DetailApplicationUser/>}/>
        <Route  path='/userApplication' element={<UserApplication />} />
      </Routes>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;