import React, { useState, useEffect } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import $ from 'jquery';
import confetti from 'canvas-confetti';
import 'slick-carousel';
import { Link, useNavigate } from 'react-router-dom';
import 'regenerator-runtime/runtime';
import { FaUser, FaShoppingCart,FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import Header from './UserHeader.jsx'
import '../style/homee.css';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faRss } from "@fortawesome/free-solid-svg-icons";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";


function App() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const position = [8.681228, 77.621993];

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
    speak("Select the Choice Exploring or Purchasing");
    setIsListening(true)
  }

  const stopListening = () => {SpeechRecognition.stopListening(); setIsListening(false)};
  
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!transcript) return;
    const timer = setTimeout(() => {
      handleModeSelection(transcript.trim().toLowerCase());
      resetTranscript();
    }, 5000);
    return () => clearTimeout(timer);
  }, [transcript]);

  useEffect(() => {
    // Stop speaking when the component unmounts (e.g., navigating to a new page)
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const speak = (text) => {
    // Stop any ongoing speech before starting a new one
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const handleModeSelection = (input) => {
    if (input.includes("explore") || input.includes("exploring")) {
      setMode("exploring");
      speak("Navigating to Exploring Page");
      navigate("/product");
    } else if (input.includes("purchase") || input.includes("purchasing")) {
      setMode("purchasing");
      speak("Navigating to Purchasing Page");
      navigate("/cart");
    } else {
      speak("Command not recognized. Please say 'Explore' or 'Purchase'.");
      resetTranscript();
    }
  };

  const nav = (e) => {
    if (e === 'explore') {
      navigate("/product");
    }
    if (e === 'order') {
      navigate("/cart");
    }
  };
  useEffect(() => {
    const sections = document.querySelectorAll('.section');

    const handleScroll = () => {
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // Reveal section when it's in the viewport
        if (sectionTop < windowHeight - 100) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  function trigerConfetti(){
     confetti({
      particleCount:2000,
      spread:360,
     })
  }
  return (
    <div>
      <div className="App">
        <Header
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
        />
      </div>

      <section className="section section1">
        <div className="content">
        <div className="hp-textbox"> <input type='text' className='textp' placeholder='Tell Explore or Order...' value={transcript} readOnly></input><div className='svg'><FaMicrophone /></div> </div>
         
        <br/>
        <button className="hp-btn hp-explore-btn" onClick={() => nav("explore")}>
          Explore
        </button>
        {/* <button onClick={startListening} className="hp-btn hp-btn-success">
          Start
        </button>
        <button onClick={stopListening} className="hp-btn hp-btn-success">
          Stop
        </button> */}
        <button className="hp-btn hp-order-btn" onClick={() => nav("order")}>
          Order
        </button>
        <h2>About the Project</h2>
        <p><b>
          The Voice-Based Shopping in Supermarket helps visually impaired users shop independently using voice commands.
          </b></p>
        </div>
      </section>
      <section className="section section3">
      <div className="content">
        <h2>How to Purchase</h2>
        <p>
          1. Start by 'Explore' Command.<br />
          2. The system will speak the list of Category tell the Category name to view Subcategory<br />
          3. The System will speak the list of Subcategory then tell the SubCategory.To view the Product Name<br />
          4. Tell the product name if its found then tell the quantity then the product will add to cart. <br/>
          5. Use 'Back' command to back one step to the previous state.<br/>
          6. Use 'cart' command to navigate to the Cart page<br/>
        </p>
        </div>
      </section>
      <section className="section section2">
       
      </section>
      <section className="section section3">
        <div className="content">
        <h2>list of Voice Commands in Cart page</h2>
        <p>
          Example voice commands:<br />
          - "Add milk to cart"<br />
          - "Checkout now"<br />
          - "Show my cart"
        </p>
        </div>
      </section>
   
      <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-socials">
         <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-icon">
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-icon">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href="https://yourblog.com" target="_blank" rel="noreferrer" className="footer-icon">
            <FontAwesomeIcon icon={faRss} />
          </a>
        </div>
        <div className="footer-designer">
          <p>Designed by VeluBhai</p>
        </div>
        <div className="footer-contact">
          <p>Contact: 40A vinayager Sannadhi street,Keelachaval, Tirunelveli, Tamilnadu</p>
        </div>
        <div className="footer-map">
          <MapContainer center={position} zoom={8} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>My home</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </footer>

    </div>
  );
};

export default App;