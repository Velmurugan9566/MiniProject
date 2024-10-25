import React,{useState,useRef} from 'react';
import '../style/ContactUsStyle.css'; // Use CSS prefix 'co'
import Header from './UserHeader'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

import "react-toastify/dist/ReactToastify.css";

import { Link, useNavigate } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';

const ContactUs = () => {
  const[user,setUser] = useState({})
  const form = useRef(null)
  const [loading, setLoading] = useState(false);
  
  function handleForm(e){
  
  e.preventDefault()
  console.log(user);
  if(!/.+\@.+\..+/.test(user.email)){
    toast.warning("Email id not valid")
  }else if(!user.msg){
    toast.info("Bro Message is part is Empty..")
  }else{
    setLoading(true);
     axios.post(`${import.meta.env.VITE_API_URL}/ContactMsg`, {user})
     .then(res=>{
          if(res.data.status ==1){
            setLoading(false)
            toast.success("Thanks for Approching..")}
          else if(res.data.status ==2){
            setLoading(false)
            toast.info("Mail id Not found Please Try again");
          }
        })
     .catch(err=>{setLoading(false); toast.warning("Error Sending Mail..")})
  }
  }
  function handleChange(e){
    const name =e.target.name;
    const value =e.target.value;
    setUser(values=>(
      {
        ...values,[name]:value
      }
    ))
  }
    
  return (
    <>
    <ToastContainer/>
     <Header/>
     <div className="mainArea">
    <div className="co-container">
      <h1 className="co-title">Contact Us</h1>
      <div className="co-details">
        <p>Email: <a href='mailto:shoppingportalmsu.com' className='co-a'>shoppingportalmsu.com</a></p>
        <p>Phone: <a href="tel:+91 9566862480" className='co-a' >+91 9566862480</a></p>
        <p>Address:40 A North cart street , Tirunelveli Town</p>
      </div>
      <div className="co-form-container">
        <form className="co-form" onSubmit={handleForm} ref={form}>
          <label className="co-label">Name</label>
          <input type="text" className="co-input" name='name' placeholder="Your Name" onChange={handleChange} />
          <label className="co-label">Email</label>
          <input type="email" className="co-input" name='email' placeholder="Your Email" onChange={handleChange}/>
          <label className="co-label">Message</label>
          <textarea className="co-textarea" name='msg' placeholder="Your Message" onChange={handleChange}></textarea>
          {loading ? (
              <button className="btn btn-success w-100 rounded-2">
                <Spinner animation="border" variant="light" />
              </button>
            ) : (
              <button type="submit" className="btn btn-success w-100 rounded-2">
                Submit
              </button>
            )}
         
        </form>
      </div>
    </div>
    </div>
    </>
  );
};

export default ContactUs;
