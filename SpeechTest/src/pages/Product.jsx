import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Header from './UserHeader'
import '../style/Productpage.css'
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingCart,FaMicrophone, FaMicrophoneSlash,FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
axios.defaults.withCredentials =true

function App() {
  const [categories, setCategories] = useState([]);
  axios.defaults.withCredentials =true
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [cart, setCart] = useState(() => JSON.parse(sessionStorage.getItem('cart')) || []);
  const [listeningForCategory, setListeningForCategory] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [currentStep, setCurrentStep] = useState("category"); // category, subcategory, product, quantity
  const [currentProduct ,setCurrentProduct] = useState([])
  const [similarMatches, setSimilarMatches] = useState([]);
  const [awaitingSelection, setAwaitingSelection] = useState(false);
  const navigate = useNavigate();
  const user = sessionStorage.getItem('userid') || ''; 
  const [shouldUpdateCart,setShouldUpdateCart] = useState(false);
  
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
        setCategories(response.data);
        speakCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        speak("Error fetching categories. Please try again later.");
      }
    };

    fetchCategories();
    const fetchCart = async () => {
      if(user){
      try { 
        console.log("fetch");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/fetchCart/${user}`);
        console.log(response.data);
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching Cart Products:", error);
        speak("Error fetching cart Products. Please try again later.");
      }
      }
    };
    fetchCart();
  }, []);

  

  useEffect(() => {
    // Stop speaking when navigating to a new page
    return () => {
      speechSynthesis.cancel();
    };
  }, []);
  const fetchSubcategories = async (category) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/subcategories/${category}`);
      setSubcategories(response.data);
      speakSubcategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      speak("Error fetching subcategories. Please try again later.");
    }
  };

  const fetchProducts = async (subcategory) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/${subcategory}`);
      setProducts(response.data);
      speakProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      speak("Error fetching products. Please try again later.");
    }
  };
  useEffect(()=>{
      if(shouldUpdateCart){
        UpdateCartItem();
        setShouldUpdateCart(false);
      }
  },[shouldUpdateCart])
   function UpdateCartItem(){
      //console.log("cart",cart);
      //console.log("jsonStrigify",JSON.stringify(cart))
      if(user){
        const email =user;
        const status =2;
        console.log("before send",cart)
        axios.put(`${import.meta.env.VITE_API_URL}/updateCart`,{cart,email,status})
        .then(msg =>console.log(msg))
        .catch(err=>console.log(err))
      }else{
       sessionStorage.setItem('cart', JSON.stringify(cart));
       console.log("session Cart",JSON.parse(sessionStorage.getItem('cart')))
      }    
    };
  
//sessionStorage.removeItem('cart')

const addToCart = (product, quantity) => {
  const discountedPrice = product.price * (1 - product.discount / 100);
  const additionalPrice = discountedPrice * quantity;
  const existingProductIndex = cart.findIndex(item => item.proname === product.proname);
  
  if (existingProductIndex >= 0) {
    const updatedCart = [...cart];
    const existingProduct = updatedCart[existingProductIndex];
    if(existingProduct.quantity +quantity > product.quantity){
      toast.info('Product out of stock')
      speak('Product out of stock');
      return;
    }
    existingProduct.quantity += quantity;
    existingProduct.totalPrice = (parseFloat(existingProduct.totalPrice) + additionalPrice).toFixed(2);
    updatedCart[existingProductIndex] = existingProduct;
    
    setCart(updatedCart);
    console.log("Cart first update",cart);
     setShouldUpdateCart(true);
    toast.success(`${quantity} more of ${product.proname} has been added to your cart. Total quantity is now ${existingProduct.quantity}.`)
    speak(`${quantity} more of ${product.proname} has been added to your cart. Total quantity is now ${existingProduct.quantity}.`);
  } else {
    // Product not in the cart, add as new entry
    const cartItem = { 
      ...product, 
      quantity, 
      totalPrice: additionalPrice.toFixed(2) 
    };
    
    setCart([...cart, cartItem]);
    console.log("Cart",cart);
    setShouldUpdateCart(true);
    //UpdateCartItem();
    toast(`${quantity} of ${product.proname} has been added to your cart with a total price of Rs.${cartItem.totalPrice}.`)
    speak(`${quantity} of ${product.proname} has been added to your cart with a total price of Rupees.${cartItem.totalPrice}.`);
  }
};

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!transcript) return;

    const processTranscript = () => {
      const lowerTranscript = transcript.trim().toLowerCase();

      if (awaitingSelection && similarMatches.length > 0) {
        const foundMatch = similarMatches.find(match => lowerTranscript.includes(match.toLowerCase()));
        if (foundMatch) {
          if (currentStep === "category") {
            setSelectedCategory(foundMatch);
            fetchSubcategories(foundMatch);
            setCurrentStep("subcategory");
          } else if (currentStep === "subcategory") {
            setSelectedSubcategory(foundMatch);
            fetchProducts(foundMatch);
            setCurrentStep("product");
          } else if (currentStep === "product") {
            const foundProduct = products.find(product => product.proname.toLowerCase() === foundMatch.toLowerCase());
            speak(`How many ${foundProduct.proname} would you like to add to your cart?`);
            setCurrentStep("quantity");
          }
          setSimilarMatches([]);
          setAwaitingSelection(false);
          resetTranscript();
          return;
        } else {
          speak("No exact match found among the options. Please try again.");
          resetTranscript();
          speakOptions(similarMatches);
          return;
        }
      }

      if (currentStep === "category") {
        const matchedCategories = categories.filter(category => new RegExp(category.toLowerCase()).test(lowerTranscript));
        if (matchedCategories.length === 1) {
          setSelectedCategory(matchedCategories[0]);
          fetchSubcategories(matchedCategories[0]);
          setCurrentStep("subcategory");
          resetTranscript();
        } else if (matchedCategories.length > 1) {
          setSimilarMatches(matchedCategories);
          setAwaitingSelection(true);
          speakOptions(matchedCategories);
          resetTranscript();
        } else {
          speak("Category not matched. Please try again.");
          resetTranscript();
          speakCategories(categories);
        }
      } else if (currentStep === "subcategory") {
        const matchedSubcategories = subcategories.filter(subcategory => new RegExp(subcategory.toLowerCase()).test(lowerTranscript));
        if (matchedSubcategories.length === 1) {
          setSelectedSubcategory(matchedSubcategories[0]);
          fetchProducts(matchedSubcategories[0]);
          setCurrentStep("product");
          resetTranscript();
        } else if (matchedSubcategories.length > 1) {
          setSimilarMatches(matchedSubcategories);
          setAwaitingSelection(true);
          speakOptions(matchedSubcategories);
          resetTranscript();
        } else {
          speak("Subcategory not matched. Please try again.");
          resetTranscript();
          speakSubcategories(subcategories);
        }
      } else if (currentStep === "product") {
        const matchedProducts = products.filter(product => new RegExp(product.proname.toLowerCase()).test(lowerTranscript));
        if (matchedProducts.length === 1) {
          console.log(matchedProducts + " match")
          const foundProduct = matchedProducts[0];
          setCurrentProduct(foundProduct)
          speak(`How many ${foundProduct.proname} would you like to add to your cart?`);
          setCurrentStep("quantity");
          resetTranscript();
        } else if (matchedProducts.length > 1) {
          setSimilarMatches(matchedProducts.map(product => product.proname));
          setAwaitingSelection(true);
          speakOptions(matchedProducts.map(product => product.proname));
          resetTranscript();
        } else {
          speak("Product not matched. Please try again.");
          resetTranscript();
          speakProducts(products);
        }
      } else if (currentStep === "quantity") {
        const quantityMatch = lowerTranscript.match(/\d+/);
        console.log(quantityMatch +"quantitymatch")
        if (quantityMatch) {
          const quantity = parseInt(quantityMatch[0], 10);
            console.log("quantity"+quantity)
          if (quantity > 0) {
            //const foundProduct = products.find(product => lowerTranscript.includes(product.proname.toLowerCase()));
            const foundProduct = currentProduct
            if (foundProduct) {
              if (quantity <= foundProduct.quantity) {
                addToCart(foundProduct, quantity);
                setCurrentStep("product");
                toast.success("Product added to cart..")
                speak("Product added to the cart. You can add another product or say 'back' to choose a different category.");
              } else {
                speak(`Only ${foundProduct.quantity} units available. Please specify a quantity up to ${foundProduct.quantity}.`);
              }
              resetTranscript();
            }
          }
          else{
            speak(`Please tell a valid quantity..`);
            setCurrentStep("quantity");
            resetTranscript();
          }
        }else{
          speak(`Please repeat the quantity value.`);
          setCurrentStep("quantity");
          resetTranscript();
        }
      }
      if (lowerTranscript.includes("repeat products")) {
        speakProducts(products);
      }

      if (lowerTranscript.includes("back")) {
        if (currentStep === "product") {
          setSelectedSubcategory("");
          setCurrentStep("subcategory");
          speakSubcategories(subcategories);
        } else if (currentStep === "subcategory") {
          setSelectedCategory("");
          setCurrentStep("category");
          speakCategories(categories);
        }else if (currentStep === "quantity") {
          setCurrentStep("product");
          speakProducts(products);
        }
        resetTranscript();
      }

      if (lowerTranscript.includes("stop")) {
        stopListening();
      }
      if (lowerTranscript.includes("repeat")) {
        if (currentStep === "category") {
          speakCategories(categories);
        } else if (currentStep === "subcategory") {
          speakSubcategories(subcategories);
        } else if (currentStep === "product") {
          speakProducts(products);
        } else if (currentStep === "quantity") {
          speak("Please specify the quantity for the selected product.");
        }
        resetTranscript();
      }
      if (lowerTranscript.includes("cart")) {
        
        resetTranscript();
        speak("Navigating to Cart page...")
        navigate("/cart");
      }
    };

    const timeoutId = setTimeout(processTranscript, 3000); // 3 seconds delay

    return () => clearTimeout(timeoutId);
  }, [transcript, categories, subcategories, products, currentStep, similarMatches, awaitingSelection]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const speak = (text) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const speakCategories = (categories) => {
    const categoryList = categories.join(", ");
    speak(`The available categories are: ${categoryList}. Please select a category.`);
  };

  const speakSubcategories = (subcategories) => {
    const subcategoryList = subcategories.join(", ");
    speak(`The available subcategories are: ${subcategoryList}. Please select a subcategory.`);
  };

  const speakProducts = (products) => {
    const productsText = products.map(product => `${product.proname} at ${product.price} rupees`).join(", ");
    speak(`Available products are: ${productsText}. Please select one.`);
    // const productList = products.map(product => product.proname).join(", ");
    // speak(`The available products are: ${productList}. Please select a product.`);
  };

  const speakOptions = (options) => {
    const optionsList = options.join(", ");
    speak(`There are multiple options available: ${optionsList}. Please select one.`);
  };

  const startListening = () => {
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    speechSynthesis.cancel();
  };
  const [quantities, setQuantities] = useState({});

  // Function to handle quantity changes
  const handleQuantityChange = (productId, change) => {
    setQuantities((prevQuantities) => {
      const newQuantity = (prevQuantities[productId] || 1) + change;
      return {
        ...prevQuantities,
        [productId]: Math.max(1, Math.min(newQuantity, products.find(p => p._id === productId).quantity)),
      };
    });
  };

  // Function to calculate the total price
  const calculateTotalPrice = (price, discount, quantity) => {
    const discountedPrice = price * (1 - discount / 100);
    return (discountedPrice * quantity).toFixed(2);
  };
  const sidebar = document.querySelector('.pro-sidebar');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  function HandleNavigation(n){
    if(n==-1){
     if (currentStep === "product") {
       setSelectedSubcategory("");
       setCurrentStep("subcategory");
       speakSubcategories(subcategories);
     } else if (currentStep === "subcategory") {
       setSelectedCategory("");
       setCurrentStep("category");
       speakCategories(categories);
     }else if (currentStep === "quantity") {
       setCurrentStep("product");
       speakProducts(products);
     }
    }
   }
console.log(cart)
  return (
  <div>
        <Header
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
        />
              <ToastContainer />
        <div className='pro-main-container'>
       
    <button onClick={toggleSidebar} className='pro-toggle-btn'>X</button>

   <div className={`pro-sidebar ${sidebarOpen ? 'show' : ''}`}>
  <button className="pro-sidebar-close-btn" onClick={toggleSidebar}>X</button>
  <h3>Current Step: {currentStep}</h3>
  <ul>
    {currentStep === "category" && categories.map((category) => (
      <li key={category}>{category}</li>
    ))}
    {currentStep === "subcategory" && subcategories.map((subcategory) => (
      <li key={subcategory}>{subcategory}</li>
    ))}
    {currentStep === "product" && products.map((product) => (
      <li key={product._id}>{product.proname}</li>
    ))}
  </ul>
</div>

  
  <div className="pro-content">
   
    <div className="navigation-arrows">
          <button onClick={(e)=>HandleNavigation(-1)} disabled={false}>
            <FaArrowLeft />
          </button>
        </div>
    <div className="hp-textbox"> <input type='text' className='textp' placeholder='Tell Explore or Order...' value={transcript} readOnly></input><div className='svg'><FaMicrophone /></div> </div>
         
        <div className="oro-content">
          
          {currentStep === "category" && (
            <><h2 className="pro-section-title">Product Categories</h2>
            <ul className="pro-category-list">
                {categories.map((category) => (
                  <li
                    key={category}
                    className="pro-category-item"
                    onClick={() => {
                      setSelectedCategory(category);
                      fetchSubcategories(category);
                      setCurrentStep("subcategory");
                    } }
                  >
                    {category}
                  </li>
                ))}
              </ul></>
          )}
          {currentStep === "subcategory" && (
            <><h2 className="pro-section-title">Product Sub-Categories</h2><ul className="pro-category-list">
                {subcategories.map((subcategory) => (
                  <li
                    key={subcategory}
                    className="pro-category-item"
                    onClick={() => {
                      setSelectedSubcategory(subcategory);
                      fetchProducts(subcategory);
                      setCurrentStep("product");
                    } }
                  >
                    {subcategory}
                  </li>
                ))}
              </ul></>
          )}
          {currentStep === "product" && (
            <><h2 className="pro-section-title">Available Products</h2><table className="pro-product-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product._id}>
                      <td>{index + 1}</td>
                      <td>{product.proname}</td>
                      <td>Rs.{product.price}</td>
                      <td>{product.discount}%</td>
                      <td>
                        <div className="pro-quantity-control">
                          <button onClick={() => handleQuantityChange(product._id, -1)}>-</button>
                          <input
                            type="text"
                            value={quantities[product._id] || 1}
                            readOnly
                            className="pro-quantity-box" />
                          <button onClick={() => handleQuantityChange(product._id, 1)}>+</button>
                        </div>
                      </td>
                      <td>
                        Rs.{calculateTotalPrice(product.price, product.discount, quantities[product._id] || 1)}
                      </td>
                      <td>
                        <button
                          className="pro-add-to-cart-btn"
                          onClick={() => addToCart(product, quantities[product._id] || 1)}
                        >
                          Add to Cart
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></>
          )}
        </div>
        
        <div className="pro-cart-section">
        
         {cart.length>0 ? (
          <>
            <h2 className="pro-section-title">Cart</h2>
            <table className='cart-table'>
              <thead>
                <tr>
                <th>
                S.No
                </th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total Price</th>
                </tr>
                              </thead>
           <tbody>
            {cart.map((item, index) => (
              <tr>
                <td>{index+1}</td><td>{item.proname}</td><td>Rs.{item.price}</td><td>{item.quantity}</td><td>{item.totalPrice}</td>
              
              </tr>
            ))}
            </tbody>
          </table>
          <button className='pro-btn' onClick={(e)=>navigate('/cart')}> Go to Cart</button>
          </>
         ):(
        null
         )}
        
        </div>
        </div>
      </div>
        <footer className="pro-footer">©2024 Vel'Z SuperMarket</footer>
      </div>  
  );
}

export default App;
