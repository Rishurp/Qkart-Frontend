import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  let [products, setProducts] = useState([]);
  let [isLoading, setLoading] = useState(true);
  let [searching, setSearching] = useState(false);
  let [searchProducts, setSearchProducts] = useState([]);
  let [isProductNull, setProductNull] = useState(true);
  let [debounceTimer, setDebounceTimer] = useState(null);

  // let product =
  // [{
  // "name":"Tan Leatherette Weekender Duffle",
  // "category":"Fashion",
  // "cost":150,
  // "rating":4,
  // "image":"https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
  // "_id":"PmInA797xJhMIPti"
  // }]

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   *
   */

  useEffect(() => {
    performAPICall();
  }, []);

  const performAPICall = async () => {
    try {
      let data = await axios.get(`${config.endpoint}/products`);
      setProducts(data.data);
      setLoading(false);
    
    } catch (err) {
      return err;
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    setSearching(true);
    try {
      let response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      if(response.data !== [])
      {
        setProductNull(false);
        setSearchProducts(response.data);
      }
      else
      {
        setProductNull(true);
        setSearching(false);
      }
      // setProductNull(false);

    } catch (err) {
      if(err.response.status === 404)
      {
        setSearchProducts([])
      }
      else
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
   const debounceSearch = (event, debounceTimeout) => {
    const text = event.target.value;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newTimer = setTimeout(() => {
      performSearch(text);
    }, debounceTimeout);

    setDebounceTimer(newTimer);
  };

  return (
    <div>
      <Header hasHiddenAuthButtons={true}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(event) => debounceSearch(event, 500)}
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile "
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(event) => debounceSearch(event, 500)}

      />
      <Grid container>
        <Grid item className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
        </Grid>
      </Grid>
      {isLoading ? (
        <div className="loading">
          <CircularProgress />
          <h4>Loading Products</h4>
        </div>
      ) :
        (<div>{searching  ? (<div>{isProductNull ? (<div
          style={{
            position: "relative",
            width: "100%",
            textAlign: "center",
          }}
        >
          <SentimentDissatisfied size={24} thickness={4} />
          <p>No products found</p>
        </div>)  : (<div>
          <Grid container spacing={2}>
            {searchProducts.map((item) => (
              <Grid key={item._id} item xs={6} md={3}>
                <ProductCard product={item} />
              </Grid>
            ))}
          </Grid>
        </div>)  }</div>):(<div>
          <Grid container spacing={2}>
            {products.map((item) => (
              <Grid key={item._id} item xs={6} md={3}>
                <ProductCard product={item} />
              </Grid>
            ))}
          </Grid>
        </div>)} </div>)
      }
      <Footer />
    </div>
  );
};

export default Products;



// 2nd code of kundan


// import { Search, SentimentDissatisfied } from "@mui/icons-material";
// import ProductCard from "./ProductCard";
// import {
//   CircularProgress,
//   Grid,
//   Button,
//   InputAdornment,
//   TextField,
// } from "@mui/material";
// import { Box } from "@mui/system";
// import axios from "axios";
// import { useSnackbar } from "notistack";
// import React, { useEffect, useState } from "react";
// import { config } from "../App";
// import Footer from "./Footer";
// import Header from "./Header";
// import "./Products.css";

// // Definition of Data Structures used
// /**
//  * @typedef {Object} Product - Data on product available to buy
//  *
//  * @property {string} name - The name or title of the product
//  * @property {string} category - The category that the product belongs to
//  * @property {number} cost - The price to buy the product
//  * @property {number} rating - The aggregate rating of the product (integer out of five)
//  * @property {string} image - Contains URL for the product image
//  * @property {string} _id - Unique ID for the product
//  */

// const Products = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchValue, setSearchValue] = useState("");
//   const [debounceTimer, setDebounceTimer] = useState(null);
//   const DEBOUNCE_TIMEOUT = 800;
//   // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
//   /**
//    * Make API call to get the products list and store it to display the products
//    *
//    * @returns { Array.<Product> }
//    *      Array of objects with complete data on all available products
//    *
//    * API endpoint - "GET /products"
//    *
//    * Example for successful response from backend:
//    * HTTP 200
//    * [
//    *      {
//    *          "name": "iPhone XR",
//    *          "category": "Phones",
//    *          "cost": 100,
//    *          "rating": 4,
//    *          "image": "https://i.imgur.com/lulqWzW.jpg",
//    *          "_id": "v4sLtEcMpzabRyfx"
//    *      },
//    *      {
//    *          "name": "Basketball",
//    *          "category": "Sports",
//    *          "cost": 100,
//    *          "rating": 5,
//    *          "image": "https://i.imgur.com/lulqWzW.jpg",
//    *          "_id": "upLK9JbQ4rMhTwt4"
//    *      }
//    * ]
//    *
//    * Example for failed response from backend:
//    * HTTP 500
//    * {
//    *      "success": false,
//    *      "message": "Something went wrong. Check the backend console for more details"
//    * }
//    */

//   useEffect(() => {
//     performAPICall();
//   }, []);
//   const performAPICall = async () => {
//     const url = `${config.endpoint}/products`;

//     try {
//       const response = await axios.get(url);
//       setProducts(response.data);
//       setLoading(false);
//       return response;
//     } catch (error) {
//       setError("Error fetching products. Please try again later.");
//       setLoading(false);
//       return null;
//     }
//   };

//   // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
//   /**
//    * Definition for search handler
//    * This is the function that is called on adding new search keys
//    *
//    * @param {string} text
//    *    Text user types in the search bar. To filter the displayed products based on this text.
//    *
//    * @returns { Array.<Product> }
//    *      Array of objects with complete data on filtered set of products
//    *
//    * API endpoint - "GET /products/search?value=<search-query>"
//    *
//    */
//   const performSearch = async (text) => {
//     const url =`${config.endpoint}/products/search?value=${text}`;
//     try {
//       const response = await axios.get(url);
//       setProducts(response.data);
//     } catch (error) { 
//       setProducts([]);
//       return null;
//     }
//   };

//   // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
//   /**
//    * Definition for debounce handler
//    * With debounce, this is the function to be called whenever the user types text in the searchbar field
//    *
//    * @param {{ target: { value: string } }} event
//    *    JS event object emitted from the search input field
//    *
//    * @param {NodeJS.Timeout} debounceTimeout
//    *    Timer id set for the previous debounce call
//    *
//    */
//   const debounceSearch = (event, debounceTimeout) => {
//     const text = event.target.value;

//     if (debounceTimer) {
//       clearTimeout(debounceTimer);
//     }

//     const newTimer = setTimeout(() => {
//       performSearch(text);
//     }, debounceTimeout);

//     setDebounceTimer(newTimer);
//   };

//   return (
//     <div>
//       <Header hasHiddenAuthButtons={false}>
//         {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
//         <TextField
//           className="search-desktop"
//           size="small"
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <Search color="primary" />
//               </InputAdornment>
//             ),
//           }}
//           placeholder="Search for items/categories"
//           name="search"
//           value={searchValue}
//           onChange={(e) => {
//             setSearchValue(e.target.value);
//             debounceSearch(e,DEBOUNCE_TIMEOUT);
//           }}
//         />
//       </Header>
//       {/* Search view for mobiles */}
//       <TextField
//         className="search-mobile"
//         size="small"
//         fullWidth
//         InputProps={{
//           endAdornment: (
//             <InputAdornment position="end">
//               <Search color="primary" />
//             </InputAdornment>
//           ),
//         }}
//         placeholder="Search for items/categories"
//         name="search"
//       />
//       <Grid container>
//         <Grid item className="product-grid">
//           <Box className="hero">
//             <p className="hero-heading">
//               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
//               to your door step
//             </p>
//           </Box>
//         </Grid>
//       </Grid>
//       {loading && (
//         <div
//           style={{
//             position: "relative",
//             width: "100%",
//             textAlign: "center",
//           }}
//         >
//           <CircularProgress size={24} thickness={4} />
//           <p>Loading Products</p>
//         </div>
//       )}
//       {error && <p className="error-message">{error}</p>}
//       {products.length > 0 && !loading && !error ? (
//         <Grid container spacing={2} style={{ marginTop: "20px" }}>
//           {products.map((product) => (
//             <Grid item key={product._id} xs={6} md={3}>
//               <ProductCard product={product} />
//             </Grid>
//           ))}
//         </Grid>
//       ) : 
//       <div style={{
//         position: "relative",
//         width: "100%",
//         textAlign: "center",
//       }}>
//          <SentimentDissatisfied size={24} thickness={4} />
//           <p>No Products Found</p>
//         </div>
//       }
//       <Footer />
//     </div>
//   );
// };

// export default Products;


























// 1st code of kundan 


// import { Search, SentimentDissatisfied } from "@mui/icons-material";
// import ProductCard from "./ProductCard";
// // import { generateCartItemsFrom } from "./Cart";
// // import Cart from "./Cart";
// import {
//   CircularProgress,
//   Grid,
//   Button,
//   InputAdornment,
//   TextField,
// } from "@mui/material";
// import { Box } from "@mui/system";
// import axios from "axios";
// import { useSnackbar } from "notistack";
// import React, { useEffect, useState } from "react";
// import { config } from "../App";
// import Footer from "./Footer";
// // import Checkout from "./Checkout"
// import Header from "./Header";
// import "./Products.css";

// // Definition of Data Structures used
// /**
//  * @typedef {Object} Product - Data on product available to buy
//  *
//  * @property {string} name - The name or title of the product

// /**
//  * @typedef {Object} CartItem -  - Data on product added to cart
//  * 
//  * @property {string} name - The name or title of the product in cart
//  * @property {string} qty - The quantity of product added to cart
//  * @property {string} category - The category that the product belongs to
//  * @property {number} cost - The price to buy the product
//  * @property {number} rating - The aggregate rating of the product (integer out of five)
//  * @property {string} image - Contains URL for the product image
//  * @property {string} _id - Unique ID for the product
//  */

// const Products = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchValue, setSearchValue] = useState("");
//   const [debounceTimer, setDebounceTimer] = useState(null);
//   const DEBOUNCE_TIMEOUT = 800;
//   const [cartItemList, setCartItemList] = useState([]);
//   // let userName = localStorage.getItem("username");
//   // let userToken = localStorage.getItem("token");
//   const { enqueueSnackbar } = useSnackbar();
//   // let cartItemList = [];
//   let cartItems = [];
//   // let quantity = 0;
//   // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
//   /**
//    * Make API call to get the products list and store it to display the products
//    *
//    * @returns { Array.<Product> }
//    *      Array of objects with complete data on all available products
//    *
//    * API endpoint - "GET /products"
//    *
//    * Example for successful response from backend:
//    * HTTP 200
//    * [
//    *      {
//    *          "name": "iPhone XR",
//    *          "category": "Phones",
//    *          "cost": 100,
//    *          "rating": 4,
//    *          "image": "https://i.imgur.com/lulqWzW.jpg",
//    *          "_id": "v4sLtEcMpzabRyfx"
//    *      },
//    *      {
//    *          "name": "Basketball",
//    *          "category": "Sports",
//    *          "cost": 100,
//    *          "rating": 5,
//    *          "image": "https://i.imgur.com/lulqWzW.jpg",
//    *          "_id": "upLK9JbQ4rMhTwt4"
//    *      }
//    * ]
//    *
//    * Example for failed response from backend:
//    * HTTP 500
//    * {
//    *      "success": false,
//    *      "message": "Something went wrong. Check the backend console for more details"
//    * }
//    */

//   useEffect(() => {
//     performAPICall();
//     // fetchCart(userToken).then((cartData) => {
//     //   setCartItemList(cartData);
//     // });
//   }, []);
//   // cartItems = userName ? generateCartItemsFrom(cartItemList, products) : [];
//   const performAPICall = async () => {
//     const url = `${config.endpoint}/products`;

//     try {
//       const response = await axios.get(url);
//       setProducts(response.data);
//       setLoading(false);
//       return response;
//     } catch (error) {
//       setError("Error fetching products. Please try again later.");
//       setLoading(false);
//       return null;
//     }
//   };

//   // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
//   /**
//    * Definition for search handler
//    * This is the function that is called on adding new search keys
//    *
//    * @param {string} text
//    *    Text user types in the search bar. To filter the displayed products based on this text.
//    *
//    * @returns { Array.<Product> }
//    *      Array of objects with complete data on filtered set of products
//    *
//    * API endpoint - "GET /products/search?value=<search-query>"
//    *
//    */
//   const performSearch = async (text) => {
//     const url =` ${config.endpoint}/products/search?value=${text}`;
//     try {
//       const response = await axios.get(url);
//       setProducts(response.data);
//     } catch (error) {
//       setProducts([]);
//       return null;
//     }
//   };

//   // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
//   /**
//    * Definition for debounce handler
//    * With debounce, this is the function to be called whenever the user types text in the searchbar field
//    *
//    * @param {{ target: { value: string } }} event
//    *    JS event object emitted from the search input field
//    *
//    * @param {NodeJS.Timeout} debounceTimeout
//    *    Timer id set for the previous debounce call
//    *
//    */
//   const debounceSearch = (event, debounceTimeout) => {
//     const text = event.target.value;

//     if (debounceTimer) {
//       clearTimeout(debounceTimer);
//     }

//     const newTimer = setTimeout(() => {
//       performSearch(text);
//     }, debounceTimeout);

//     setDebounceTimer(newTimer);
//   };

//   /**
//    * Perform the API call to fetch the user's cart and return the response
//    *
//    * @param {string} token - Authentication token returned on login
//    *
//    * @returns { Array.<{ productId: string, qty: number }> | null }
//    *    The response JSON object
//    *
//    * Example for successful response from backend:
//    * HTTP 200
//    * [
//    *      {
//    *          "productId": "KCRwjF7lN97HnEaY",
//    *          "qty": 3
//    *      },
//    *      {
//    *          "productId": "BW0jAAeDJmlZCF8i",
//    *          "qty": 1
//    *      }
//    * ]
//    *
//    * Example for failed response from backend:
//    * HTTP 401
//    * {
//    *      "success": false,
//    *      "message": "Protected route, Oauth2 Bearer token not found"
//    * }
//    */
//   // const fetchCart = async (token) => {
//   //   if (!token) return;

//   //   try {
//   //     // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
//   //     const url = `${config.endpoint}/cart`;
//   //     const response = await axios.get(url, {
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     return response.data;
//   //   } catch (e) {
//   //     if (e.response && e.response.status === 400) {
//   //       enqueueSnackbar(e.response.data.message, { variant: "error" });
//   //     } else {
//   //       enqueueSnackbar(
//   //         "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
//   //         {
//   //           variant: "error",
//   //         }
//   //       );
//   //     }
//   //     return null;
//   //   }
//   // };

//   // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
//   /**
//    * Return if a product already is present in the cart
//    *
//    * @param { Array.<{ productId: String, quantity: Number }> } items
//    *    Array of objects with productId and quantity of products in cart
//    * @param { String } productId
//    *    Id of a product to be checked
//    *
//    * @returns { Boolean }
//    *    Whether a product of given "productId" exists in the "items" array
//    *
//    */
//   // const isItemInCart = (items, productId) => {
//   //   return items.some((item) => item.productId === productId);
//   // };

//   /**
//    * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
//    *
//    * @param {string} token
//    *    Authentication token returned on login
//    * @param { Array.<{ productId: String, quantity: Number }> } items
//    *    Array of objects with productId and quantity of products in cart
//    * @param { Array.<Product> } products
//    *    Array of objects with complete data on all available products
//    * @param {string} productId
//    *    ID of the product that is to be added or updated in cart
//    * @param {number} qty
//    *    How many of the product should be in the cart
//    * @param {boolean} options
//    *    If this function was triggered from the product card's "Add to Cart" button
//    *
//    * Example for successful response from backend:
//    * HTTP 200 - Updated list of cart items
//    * [
//    *      {
//    *          "productId": "KCRwjF7lN97HnEaY",
//    *          "qty": 3
//    *      },
//    *      {
//    *          "productId": "BW0jAAeDJmlZCF8i",
//    *          "qty": 1
//    *      }
//    * ]
//    *
//    * Example for failed response from backend:
//    * HTTP 404 - On invalid productId
//    * {
//    *      "success": false,
//    *      "message": "Product doesn't exist"
//    * }
//    */

//   //  const handleQuantity = async (productId, newQuantity) => {
//   //   if (newQuantity < 1) {
//   //     // If the new quantity is less than one, remove the item from the cart
//   //     const updatedCart = cartItemList.filter((item) => item.productId !== productId);
//   //     setCartItemList(updatedCart);
//   //   } else {
//   //     // Update the quantity for the specified product
//   //     const updatedCart = cartItemList.map((item) => {
//   //       if (item.productId === productId) {
//   //         return { ...item, qty: newQuantity };
//   //       }
//   //       return item;
//   //     });
//   //     setCartItemList(updatedCart);
//   //   }
  
//     // Update the cart through the API call
//   //   await addToCart(userToken, cartItemList, products, productId, newQuantity);
//   // };
  

//   // const handleAddToCart = (data) => {
//   //   if (isItemInCart(cartItemList, data._id)) {
//   //     enqueueSnackbar("item already in cart", { variant: "warning" });
//   //   } else {
//   //     // Update the local state immediately
//   //     setCartItemList([...cartItemList, { productId: data._id, qty: 1 }]);
//   //     // Call addToCart for API update
//   //     addToCart(userToken, cartItemList, products, data._id, 1, { preventDuplicate: true });
//   //     // enqueueSnackbar(Added ${data.name} to the cart, {
//   //     //   variant: "success",
//   //     // });
//   //   }
//   // };
//   // const addToCart = async (
//   //   token,
//   //   items,
//   //   products,
//   //   productId,
//   //   qty,
//   //   options = { preventDuplicate: false }
//   // ) => {
//   //   try {
//   //     const requestData = {
//   //       productId,
//   //       qty,
//   //     };

//       // const response = await axios.post(
//       //   `${config.endpoint}/cart`,
//       //   requestData,
//       //   {
//       //     headers: {
//       //       Authorization: `Bearer ${token}`,
//       //     },
//       //   }
//       // );

//       // console.log(items);
//       // const findProduct = products.find((product => product._id === productId))
//       // enqueueSnackbar(Added ${findProduct.name} to the cart, {
//       //   variant: "success",
//       // });
//   //   } catch (error) {
//   //     console.error("Error adding to cart:", error);
//   //     enqueueSnackbar("Error adding to cart. Please try again.", {
//   //       variant: "error",
//   //     });
//   //   }
//   // };

//   return (
//     <div>
//       <Header hasHiddenAuthButtons={false}>
//         {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
//         <TextField
//           className="search-desktop"
//           size="small"
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <Search color="primary" />
//               </InputAdornment>
//             ),
//           }}
//           placeholder="Search for items/categories"
//           name="search"
//           value={searchValue}
//           onChange={(e) => {
//             setSearchValue(e.target.value);
//             debounceSearch(e, DEBOUNCE_TIMEOUT);
//           }}
//         />
//       </Header>

//       <TextField
//         className="search-mobile"
//         size="small"
//         fullWidth
//         InputProps={{
//           endAdornment: (
//             <InputAdornment position="end">
//               <Search color="primary" />
//             </InputAdornment>
//           ),
//         }}
//         placeholder="Search for items/categories"
//         name="search"
//       />
//       <Grid container>
//         <Grid item className="product-grid" >
//           <Box className="hero">
//             <p className="hero-heading">
//               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
//               to your door step
//             </p>
//           </Box>
//           {loading && (
//             <div
//               style={{
//                 position: "relative",
//                 width: "100%",
//                 textAlign: "center",
//               }}
//             >
//               <CircularProgress size={24} thickness={4} />
//               <p>Loading Products</p>
//             </div>
//           )}
//           {error && <p className="error-message">{error}</p>}
//           {products.length > 0 && !loading && !error ? (
//             <Grid container spacing={2} style={{ marginTop: "5px" }}>
//               {products.map((product) => (
//                 <Grid item key={product._id} xs={6} md={3}>
//                   <ProductCard
//                     product={product}
//                   />
//                 </Grid>
//               ))}
//             </Grid>
//           ) : (
//             <div
//               style={{
//                 position: "relative",
//                 width: "100%",
//                 textAlign: "center",
//               }}
//             >
//               <SentimentDissatisfied size={24} thickness={4} />
//               <p>No products found</p>
//             </div>
//           )}
//         </Grid>
//         <Grid item xs={12} md={4} style={{ backgroundColor: "#E9F5E1" }}>
//         </Grid>
//       </Grid>
//       {/* TODO: CRIO_TASK_MODULE_CART - Display the Cart component */}
//       <Footer />
//     </div>
//   );
// };

// export default Products;



