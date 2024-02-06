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
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import * as url from "url";

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const isLoggedIn = localStorage.getItem("username") || false;
  const token = localStorage.getItem("token");
  const [productList, updateProductList] = useState([]);
  const [searchKey, updateSearchKey] = useState("");
  const [apiProgress, updateApiProgress] = useState(false);
  const [timerId, setTimerId] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItemsOnLoad, setCartItemsOnLoad] = useState([]);
  const [currentCartItems, updateCurrentCartItems] = useState([]);

  const getProductGrid = (handleAddToCart) => {
    let productGrid = <Grid></Grid>;
    if (apiProgress) {
      return (
        <Grid container spacing={0} alignItems="center" justifyContent="center">
          <CircularProgress></CircularProgress>
          <p>Loading Products</p>
        </Grid>
      );
    }
    if (filteredProducts.length > 0) {
      productGrid = filteredProducts.map((product) => (
        <Grid item xs={12} sm={6} md={3} key={product._id}>
          <ProductCard handleAddToCart={handleAddToCart} product={product} />
        </Grid>
      ));
    } else {
      productGrid = (
        <Grid container spacing={0} alignItems="center" justifyContent="center">
          <SentimentDissatisfied></SentimentDissatisfied>
          <p>No products found</p>
        </Grid>
      );
    }
    return productGrid;
  };

  const performAPICall = async () => {
    updateApiProgress(true);
    const response = await axios
      .get(`${config.endpoint}/products`)
      .then((response) => {
        updateProductList(response.data);
        setFilteredProducts(response.data);
        updateApiProgress(false);
        return response.data;
      })
      .catch((error) => {
        if (error.response.status === 404) {
          //console.log("no products");
          setFilteredProducts([]);
          updateApiProgress(false);
        }
      });
  };

  const performSearch = async () => {
    updateApiProgress(true);
    let url = `${config.endpoint}/products/search?value=${searchKey}`;
    //console.log("searchKey", searchKey, url)

    const searcheResult = await axios
      .get(url)
      .then((response) => {
        //console.log("search", response.data)
        setFilteredProducts(response.data);
        updateApiProgress(false);
        return response.data;
      })
      .catch((error) => {
        //console.log(error)
        if (error.response.status === 404) {
          //qconsole.log("no products");
          setFilteredProducts([]);
          updateApiProgress(false);
        }
      });
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;
    //console.log("token", token)
    const axiosHeaders = {
      Authorization: "Bearer " + token,
    };
    try {
      //: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const res = await axios.get(`${config.endpoint}/cart`, {
        headers: axiosHeaders,
      });

      //console.log(res.data)
      setCartItemsOnLoad(res.data);
      updateCurrentCartItems(res.data);

      return res.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    const itemsInCart = items.filter((item) => item.productId === productId);
    return itemsInCart.length > 0;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   *      "success": true
   * }
   *
   * Example for failed response from backend:
   * HTTP 404
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (options.preventDuplicate) {
      if (isItemInCart(items, productId)) {
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          { variant: "warning" }
        );
        return null;
      }
    }

    var data = JSON.stringify({
      productId: productId,
      qty: qty,
    });

    var axiosConfig = {
      method: "post",
      url: config.endpoint + "/cart",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(axiosConfig)
      .then(function (response) {
        if (options.delete) {
          enqueueSnackbar("Product removed from cart", { variant: "success" });
        } else if (options.fromProducts) {
          enqueueSnackbar("Product added to cart", { variant: "success" });
        } else {
          enqueueSnackbar("Product quantity updated", { variant: "success" });
        }
        updateCurrentCartItems(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleAddToCart = (productId) => {
    addToCart(token, currentCartItems, productList, productId, 1, {
      fromProducts: true,
      preventDuplicate: true,
    });
  };

  const handleQuantity = (productId, quantity) => {
    //console.log("handle quantity", productId, quantity)
    let options = { preventDuplicate: false };
    if (quantity === 0) {
      options = { ...options, ["delete"]: true };
    }
    addToCart(
      token,
      currentCartItems,
      productList,
      productId,
      quantity,
      options
    );
  };

  const getCart = () => {
    if (isLoggedIn) {
      return (
        <Grid bgcolor="#E9F5E1" item md={3}>
          <Cart
            handleQuantity={handleQuantity}
            products={productList}
            items={currentCartItems}
          />
        </Grid>
      );
    } else {
      <Grid></Grid>;
    }
  };

  useEffect(() => {
    performAPICall();
    fetchCart(token);
  }, []);

  useEffect(() => {
    if (!searchKey) {
      setFilteredProducts(productList);
    } else {
      if (timerId) {
        clearTimeout(timerId);
      }
      const debounceTimerId = setTimeout(() => performSearch(), 500);
      setTimerId(debounceTimerId);
    }
  }, [searchKey]);

  return (
    <div>
      <Header
        searchBox={
          <TextField
            value={searchKey}
            onChange={(event) => updateSearchKey(event.target.value)}
            className="search-desktop"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for items/categories"
            name="search"
          />
        }
      />

      <TextField
        value={searchKey}
        onChange={(event) => updateSearchKey(event.target.value)}
        className="search-mobile"
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
      />
      <Grid container direction="row">
        <Grid item md>
          <Grid>
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                to your door step
              </p>
            </Box>
          </Grid>
          <Grid container className="product-grid" spacing={2}>
            {" "}
            {getProductGrid(handleAddToCart)}{" "}
          </Grid>
          {/* <Grid container className="product-grid"> {getProductGrid()} </Grid> */}
        </Grid>
        {getCart()}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products



















// import { Search, SentimentDissatisfied } from "@mui/icons-material";
// import {
//   CircularProgress,
//   Grid,
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
// import ProductCard from "./ProductCard";
// import Cart from "./Cart";
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
//   let [products, setProducts] = useState([]);
//   let [isLoading, setLoading] = useState(true);
//   let [searching, setSearching] = useState(false);
//   let [searchProducts, setSearchProducts] = useState([]);
//   let [isProductNull, setProductNull] = useState(true);
//   let [debounceTimer, setDebounceTimer] = useState(null);
//   let [isLoggedIn, setLoggedIn] = useState("false");
//   let username=localStorage.getItem("username");
//   const { enqueueSnackbar } = useSnackbar();
//   let token = localStorage.getItem("token");
//   const [cartItemsOnLoad, setCartItemsOnLoad] = useState([]);
//   const [currentCartItems, updateCurrentCartItems] = useState([]);
//   // let product =
//   // [{
//   // "name":"Tan Leatherette Weekender Duffle",
//   // "category":"Fashion",
//   // "cost":150,
//   // "rating":4,
//   // "image":"https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
//   // "_id":"PmInA797xJhMIPti"
//   // }]

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
//    *
//    */

//   useEffect(() => {
//     performAPICall();
//     fetchCart(token);
//     if(username !== null)
//     {
//       setLoggedIn(true);
//     }
//     else
//     {
//       setLoggedIn(false);
//     }
//   }, [username]);


//   const performAPICall = async () => {
//     try {
//       let data = await axios.get(`${config.endpoint}/products`);
//       setProducts(data.data);
//       setLoading(false);
    
//     } catch (err) {
//       return err;
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
//     setSearching(true);
//     try {
//       let response = await axios.get(
//         `${config.endpoint}/products/search?value=${text}`
//       );
//       if(response.data !== [])
//       {
//         setProductNull(false);
//         setSearchProducts(response.data);
//       }
//       else
//       {
//         setProductNull(true);
//         setSearching(false);
//       }
//       // setProductNull(false);

//     } catch (err) {
//       if(err.response.status === 404)
//       {
//         setSearchProducts([])
//       }
//       else
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
//    const debounceSearch = (event, debounceTimeout) => {
//     const text = event.target.value;

//     if (debounceTimer) {
//       clearTimeout(debounceTimer);
//     }

//     const newTimer = setTimeout(() => {
//       performSearch(text);
//     }, debounceTimeout);

//     setDebounceTimer(newTimer);
//   };


// /*
//   * @param {string} token
//   *    Authentication token returned on login
//   * @param { Array.<{ productId: String, quantity: Number }> } items
//   *    Array of objects with productId and quantity of products in cart
//   * @param { Array.<Product> } products
//   *    Array of objects with complete data on all available products
//   * @param {string} productId
//   *    ID of the product that is to be added or updated in cart
//   * @param {number} qty
//   *    How many of the product should be in the cart
//   * @param {boolean} options
//   *    If this function was triggered from the product card's "Add to Cart" button
//   *
//   * Example for successful response frconst debounceSearch = (event, debounceTimeout) => {
//  };


//  /**
//   * Perform the API call to fetch the user's cart and return the response
//   *
//   * @param {string} token - Authentication token returned on login
//   *
//   * @returns { Array.<{ productId: string, qty: number }> | null }
//   *    The response JSON object
//   *
//   * Example for successful response from backend:
//   * HTTP 200
//   * [
//   *      {
//   *          "productId": "KCRwjF7lN97HnEaY",
//   *          "qty": 3
//   *      },
//   *      {
//   *          "productId": "BW0jAAeDJmlZCF8i",
//   *          "qty": 1
//   *      }
//   * ]
//   *
//   * Example for failed response from backend:
//   * HTTP 401
//   * {
//   *      "success": false,
//   *      "message": "Protected route, Oauth2 Bearer token not found"
//   * }
//   */
// //  const fetchCart = async (token) => {
// //    if (!token) return null;

// //    try {
// //      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
// //      let response = await axios.get('http://localhost:8082/api/v1/cart',{
// //       headers: {
// //         'Authorization': `Bearer ${token}`
// //       }
// //      });
// //      console.log(response);

// //    } catch (e) {
// //      if (e.response && e.response.status === 400) {
// //        enqueueSnackbar(e.response.data.message, { variant: "error" });
// //      } else {
// //        enqueueSnackbar(
// //          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
// //          {
// //            variant: "error",
// //          }
// //        );
// //      }
// //      return null;
// //    }
// //  };

//  const fetchCart = async (token) => {
//   if (!token) return;
//   //console.log("token", token)
//   const axiosHeaders = {
//     Authorization: "Bearer " + token,
//   };
//   try {
//     //: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
//     const res = await axios.get(`${config.endpoint}/cart`, {
//       headers: axiosHeaders,
//     });

//     //console.log(res.data)
//     setCartItemsOnLoad(res.data);
//     updateCurrentCartItems(res.data);

//     return res.data;
//   } catch (e) {
//     if (e.response && e.response.status === 400) {
//       enqueueSnackbar(e.response.data.message, { variant: "error" });
//     } else {
//       enqueueSnackbar(
//         "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
//         {
//           variant: "error",
//         }
//       );
//     }
//     return null;
//   }
// };

//  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
//  /**
//   * Return if a product already is present in the cart
//   *
//   * @param { Array.<{ productId: String, quantity: Number }> } items
//   *    Array of objects with productId and quantity of products in cart
//   * @param { String } productId
//   *    Id of a product to be checked
//   *
//   * @returns { Boolean }
//   *    Whether a product of given "productId" exists in the "items" array
//   *
//   */
//  const isItemInCart = (items, productId) => {

//  };

//  /**
//   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
//   *om backend:
//   * HTTP 200 - Updated list of cart items
//   * [
//   *      {
//   *          "productId": "KCRwjF7lN97HnEaY",
//   *          "qty": 3
//   *      },
//   *      {
//   *          "productId": "BW0jAAeDJmlZCF8i",
//   *          "qty": 1
//   *      }
//   * ]
//   *
//   * Example for failed response from backend:
//   * HTTP 404 - On invalid productId
//   * {
//   *      "success": false,
//   *      "message": "Product doesn't exist"
//   * }
//   */
// //  const addToCart = async (
// //    token,
// //    items,
// //    products,
// //    productId,
// //    qty,
// //    options = { preventDuplicate: false }
// //  ) => {


// //  };


// const addToCart = async (
//   token,
//   items,
//   products,
//   productId,
//   qty,
//   options = { preventDuplicate: false }
// ) => {
//   if (options.preventDuplicate) {
//     if (isItemInCart(items, productId)) {
//       enqueueSnackbar(
//         "Item already in cart. Use the cart sidebar to update quantity or remove item.",
//         { variant: "warning" }
//       );
//       return null;
//     }
//   }

//   var data = JSON.stringify({
//     productId: productId,
//     qty: qty,
//   });

//   var axiosConfig = {
//     method: "post",
//     url: config.endpoint + "/cart",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     data: data,
//   };

//   axios(axiosConfig)
//     .then(function (response) {
//       if (options.delete) {
//         enqueueSnackbar("Product removed from cart", { variant: "success" });
//       } else if (options.fromProducts) {
//         enqueueSnackbar("Product added to cart", { variant: "success" });
//       } else {
//         enqueueSnackbar("Product quantity updated", { variant: "success" });
//       }
//       updateCurrentCartItems(response.data);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// };

 



//   return (
//     <div>
//       <Header hasHiddenAuthButtons={true}>
//         {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
//         <TextField
//           className="search-desktop"
//           size="small"
//           fullWidth
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <Search color="primary" />
//               </InputAdornment>
//             ),
//           }}
//           placeholder="Search for items/categories"
//           name="search"
//           onChange={(event) => debounceSearch(event, 500)}
//         />
//       </Header>

//       {/* Search view for mobiles */}
//       <TextField
//         className="search-mobile "
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
//         onChange={(event) => debounceSearch(event, 500)}

//       />
//      <Grid container >
//       <Grid item sm={12} md={ isLoggedIn ? 8 : 12 }>
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
//       {isLoading ? (
//         <div className="loading">
//           <CircularProgress />
//           <h4>Loading Products</h4>
//         </div>
//       ) :
//         (<div>{searching  ? (<div>{isProductNull ? (<div
//           style={{
//             position: "relative",
//             width: "100%",
//             textAlign: "center",
//           }}
//         >
//           <SentimentDissatisfied size={24} thickness={4} />
//           <p>No products found</p>
//         </div>)  : (<div>
//           <Grid container spacing={2}>
//             {searchProducts.map((item) => (
//               <Grid key={item._id} item xs={6} md={3}>
//                 <ProductCard product={item} />
//               </Grid>
//             ))}
//           </Grid>
//         </div>)  }</div>):(<div>
//           <Grid container spacing={2}>
//             {products.map((item) => (
//               <Grid key={item._id} item xs={6} md={3}>
//                 <ProductCard product={item} />
//               </Grid>
//             ))}
//           </Grid>
//         </div>)} </div>)
//       }
//     </Grid>
//         {/* TODO: CRIO_TASK_MODULE_CART - Display the Cart component */}
        
//         { isLoggedIn && 
//         <Grid item sm={12} md={4}>
//         <Cart/>
//         </Grid>
//         }
//         </Grid>
//       <Footer />
//     </div>
//   );
// };

// export default Products;





